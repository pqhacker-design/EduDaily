import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, Plugin } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

function geminiServerPlugin(): Plugin {
  return {
    name: 'gemini-server-plugin',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url === '/api/gemini/generate-quiz' && req.method === 'POST') {
          const chunks: any[] = [];
          req.on('data', chunk => {
            chunks.push(chunk);
          });
          req.on('error', err => {
            console.warn('Request read error:', err);
            res.statusCode = 200;
            res.end(JSON.stringify({ success: false, reason: 'READ_ERROR' }));
          });
          req.on('end', async () => {
            res.setHeader('Content-Type', 'application/json');
            try {
              const body = Buffer.concat(chunks).toString('utf-8');
              const { subject, grade, topic, questionCount, difficulty } = JSON.parse(body || '{}');
              const apiKey = process.env.GEMINI_API_KEY;

              if (!apiKey) {
                res.statusCode = 200;
                res.end(JSON.stringify({ success: false, reason: 'NO_API_KEY' }));
                return;
              }

              const ai = new GoogleGenAI({ apiKey });
              const prompt = `Bạn là chuyên gia giáo dục biên soạn đề thi trắc nghiệm theo chương trình Giáo dục phổ thông (GDPT 2018) của Bộ Giáo dục và Đào tạo Việt Nam.
Hãy tạo ${questionCount || 4} câu hỏi trắc nghiệm khách quan 4 lựa chọn (A, B, C, D) cho:
- Môn: ${subject || 'Toán học'}
- Lớp: ${grade || 10}
- Chủ đề: ${topic || 'Kiến thức trọng tâm'}
- Mức độ: ${difficulty || 'Thông hiểu'}

YÊU CẦU:
1. Nội dung chuẩn xác 100% theo SGK chương trình GDPT hiện hành.
2. Mỗi câu hỏi gồm:
   - "text": Câu hỏi rõ ràng, sư phạm
   - "options": Mảng chính xác 4 lựa chọn [A, B, C, D]
   - "correctIndex": Chỉ số 0, 1, 2 hoặc 3 của đáp án đúng
   - "explanation": Lời giải thích chi tiết, phương pháp giải rõ ràng từng bước.
3. Trả về DUY NHẤT một mảng JSON các câu hỏi.`;

              let questions: any[] = [];
              try {
                // Use standard gemini-3.8-flash for text tasks per gemini-api skill
                const response = await ai.models.generateContent({
                  model: 'gemini-3.8-flash',
                  contents: prompt,
                  config: {
                    responseMimeType: 'application/json',
                    responseSchema: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          text: { type: Type.STRING },
                          options: {
                            type: Type.ARRAY,
                            items: { type: Type.STRING }
                          },
                          correctIndex: { type: Type.INTEGER },
                          explanation: { type: Type.STRING }
                        },
                        required: ['text', 'options', 'correctIndex', 'explanation']
                      }
                    }
                  }
                });

                if (response.text) {
                  const cleaned = response.text.replace(/```json/g, '').replace(/```/g, '').trim();
                  questions = JSON.parse(cleaned);
                }
              } catch (flashErr: any) {
                console.warn('gemini-3.8-flash unavailable or quota limit reached, attempting fallback to gemini-3.1-flash-lite:', flashErr?.message || flashErr);
                try {
                  const fallbackResponse = await ai.models.generateContent({
                    model: 'gemini-3.1-flash-lite',
                    contents: prompt,
                    config: {
                      responseMimeType: 'application/json',
                      responseSchema: {
                        type: Type.ARRAY,
                        items: {
                          type: Type.OBJECT,
                          properties: {
                            text: { type: Type.STRING },
                            options: {
                              type: Type.ARRAY,
                              items: { type: Type.STRING }
                            },
                            correctIndex: { type: Type.INTEGER },
                            explanation: { type: Type.STRING }
                          },
                          required: ['text', 'options', 'correctIndex', 'explanation']
                        }
                      }
                    }
                  });
                  if (fallbackResponse.text) {
                    const cleaned = fallbackResponse.text.replace(/```json/g, '').replace(/```/g, '').trim();
                    questions = JSON.parse(cleaned);
                  }
                } catch (liteErr: any) {
                  console.warn('Gemini quota reached on free tier. Using GDPT curriculum bank seamlessly:', liteErr?.message || liteErr);
                  res.statusCode = 200;
                  res.end(JSON.stringify({ 
                    success: false, 
                    reason: 'QUOTA_EXCEEDED_OR_UNAVAILABLE',
                    error: liteErr?.message || 'Gemini quota reached' 
                  }));
                  return;
                }
              }

              res.statusCode = 200;
              res.end(JSON.stringify({ success: true, questions }));
            } catch (err: any) {
              console.warn('Handled generation exception, defaulting to curriculum bank:', err?.message || err);
              res.statusCode = 200;
              res.end(JSON.stringify({ success: false, error: err?.message || 'Generation failed' }));
            }
          });
          return;
        }

        if (req.url === '/api/gemini/refine-question' && req.method === 'POST') {
          const chunks: any[] = [];
          req.on('data', chunk => {
            chunks.push(chunk);
          });
          req.on('error', err => {
            console.warn('Request read error:', err);
            res.statusCode = 200;
            res.end(JSON.stringify({ success: false, reason: 'READ_ERROR' }));
          });
          req.on('end', async () => {
            res.setHeader('Content-Type', 'application/json');
            try {
              const body = Buffer.concat(chunks).toString('utf-8');
              const { originalQuestion, prompt: teacherPrompt, subject, grade, topic } = JSON.parse(body || '{}');
              const apiKey = process.env.GEMINI_API_KEY;

              if (!apiKey) {
                res.statusCode = 200;
                res.end(JSON.stringify({ success: false, reason: 'NO_API_KEY' }));
                return;
              }

              const ai = new GoogleGenAI({ apiKey });
              const systemPrompt = `Bạn là chuyên gia sư phạm biên soạn đề thi trắc nghiệm theo chương trình Giáo dục phổ thông (GDPT 2018) của Bộ GD&ĐT Việt Nam.
Giáo viên đang cần THAY ĐỔI, TINH CHỈNH hoặc BỔ SUNG câu hỏi trắc nghiệm khách quan 4 lựa chọn (A, B, C, D) cho môn ${subject || 'Toán học'} Lớp ${grade || 10}.

CÂU HỎI HIỆN TẠI:
- Nội dung: ${originalQuestion?.text || ''}
- Phương án: A: ${originalQuestion?.options?.[0] || ''} | B: ${originalQuestion?.options?.[1] || ''} | C: ${originalQuestion?.options?.[2] || ''} | D: ${originalQuestion?.options?.[3] || ''}
- Đáp án đúng hiện tại: Chỉ số ${originalQuestion?.correctIndex ?? 0}
- Lời giải hiện tại: ${originalQuestion?.explanation || ''}

YÊU CẦU THAY ĐỔI TỪ GIÁO VIÊN:
"${teacherPrompt || 'Làm mới câu hỏi, tăng tính thực tiễn và đảm bảo chuẩn xác theo SGK GDPT 2018.'}"

HÃY TRẢ VỀ CÂU HỎI MỚI ĐÃ ĐƯỢC CHỈNH SỬA VỚI CÁC TRƯỜNG:
- "text": Câu hỏi mới rõ ràng, mạch lạc, sư phạm
- "options": Đúng 4 lựa chọn [A, B, C, D]
- "correctIndex": Chỉ số 0, 1, 2 hoặc 3 của đáp án đúng
- "explanation": Lời giải thích phương pháp giải rõ ràng, chi tiết từng bước.`;

              let refinedQuestion: any = null;
              try {
                const response = await ai.models.generateContent({
                  model: 'gemini-3.8-flash',
                  contents: systemPrompt,
                  config: {
                    responseMimeType: 'application/json',
                    responseSchema: {
                      type: Type.OBJECT,
                      properties: {
                        text: { type: Type.STRING },
                        options: {
                          type: Type.ARRAY,
                          items: { type: Type.STRING }
                        },
                        correctIndex: { type: Type.INTEGER },
                        explanation: { type: Type.STRING }
                      },
                      required: ['text', 'options', 'correctIndex', 'explanation']
                    }
                  }
                });

                if (response.text) {
                  const cleaned = response.text.replace(/```json/g, '').replace(/```/g, '').trim();
                  refinedQuestion = JSON.parse(cleaned);
                }
              } catch (flashErr: any) {
                console.warn('gemini-3.8-flash unavailable, attempting fallback to gemini-3.1-flash-lite:', flashErr?.message || flashErr);
                try {
                  const fallbackResponse = await ai.models.generateContent({
                    model: 'gemini-3.1-flash-lite',
                    contents: systemPrompt,
                    config: {
                      responseMimeType: 'application/json',
                      responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                          text: { type: Type.STRING },
                          options: {
                            type: Type.ARRAY,
                            items: { type: Type.STRING }
                          },
                          correctIndex: { type: Type.INTEGER },
                          explanation: { type: Type.STRING }
                        },
                        required: ['text', 'options', 'correctIndex', 'explanation']
                      }
                    }
                  });
                  if (fallbackResponse.text) {
                    const cleaned = fallbackResponse.text.replace(/```json/g, '').replace(/```/g, '').trim();
                    refinedQuestion = JSON.parse(cleaned);
                  }
                } catch (liteErr: any) {
                  console.warn('Gemini quota reached for refine:', liteErr?.message || liteErr);
                  res.statusCode = 200;
                  res.end(JSON.stringify({ 
                    success: false, 
                    reason: 'QUOTA_EXCEEDED_OR_UNAVAILABLE',
                    error: liteErr?.message || 'Quota limit reached'
                  }));
                  return;
                }
              }

              res.statusCode = 200;
              res.end(JSON.stringify({ success: true, question: refinedQuestion }));
            } catch (err: any) {
              console.warn('Handled question refine error:', err?.message || err);
              res.statusCode = 200;
              res.end(JSON.stringify({ success: false, error: err?.message || 'Refine failed' }));
            }
          });
          return;
        }

        next();
      });
    }
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), geminiServerPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
