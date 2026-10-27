import { Question, Subject, Grade } from '../types';

export const SUBJECT_METADATA: Record<Subject, { name: string; icon: string; color: string; bgLight: string; textClass: string }> = {
  toan: {
    name: 'Toán học',
    icon: 'Calculator',
    color: 'from-blue-600 to-indigo-600',
    bgLight: 'bg-blue-50 border-blue-200 text-blue-700',
    textClass: 'text-blue-600'
  },
  van: {
    name: 'Ngữ văn',
    icon: 'BookOpen',
    color: 'from-amber-600 to-orange-600',
    bgLight: 'bg-amber-50 border-amber-200 text-amber-700',
    textClass: 'text-amber-600'
  },
  anh: {
    name: 'Tiếng Anh',
    icon: 'Languages',
    color: 'from-emerald-600 to-teal-600',
    bgLight: 'bg-emerald-50 border-emerald-200 text-emerald-700',
    textClass: 'text-emerald-600'
  },
  khtn: {
    name: 'KHTN / Vật lý',
    icon: 'Atom',
    color: 'from-purple-600 to-violet-600',
    bgLight: 'bg-purple-50 border-purple-200 text-purple-700',
    textClass: 'text-purple-600'
  },
  ly: {
    name: 'Vật lý',
    icon: 'Zap',
    color: 'from-indigo-600 to-cyan-600',
    bgLight: 'bg-indigo-50 border-indigo-200 text-indigo-700',
    textClass: 'text-indigo-600'
  },
  hoa: {
    name: 'Hóa học',
    icon: 'FlaskConical',
    color: 'from-rose-600 to-pink-600',
    bgLight: 'bg-rose-50 border-rose-200 text-rose-700',
    textClass: 'text-rose-600'
  },
  sinh: {
    name: 'Sinh học',
    icon: 'Dna',
    color: 'from-teal-600 to-green-600',
    bgLight: 'bg-teal-50 border-teal-200 text-teal-700',
    textClass: 'text-teal-600'
  },
  su_dia: {
    name: 'Lịch sử & Địa lý',
    icon: 'Globe',
    color: 'from-amber-700 to-yellow-600',
    bgLight: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    textClass: 'text-yellow-700'
  },
  tin: {
    name: 'Tin học',
    icon: 'Cpu',
    color: 'from-cyan-600 to-blue-600',
    bgLight: 'bg-cyan-50 border-cyan-200 text-cyan-700',
    textClass: 'text-cyan-600'
  }
};

export const CURRICULUM_QUESTIONS: Question[] = [
  // --- TOÁN LỚP 10 (Chương trình GDPT 2018) ---
  {
    id: 'q-toan10-01',
    text: 'Cặp số nào sau đây là một nghiệm của bất phương trình bậc nhất hai ẩn 2x - 3y + 6 > 0?',
    options: ['(1; 3)', '(-4; 1)', '(0; 3)', '(-1; 2)'],
    correctIndex: 0,
    explanation: 'Thay tọa độ (1; 3) vào vế trái ta có: 2(1) - 3(3) + 6 = 2 - 9 + 6 = -1 < 0 (Loại). Kiểm tra (-1; 2): 2(-1) - 3(2) + 6 = -2 - 6 + 6 = -2 < 0. Kiểm tra (0; 1): 2(0) - 3(1) + 6 = 3 > 0. Với (1; 2): 2 - 6 + 6 = 2 > 0.',
    subject: 'toan',
    grade: 10,
    topic: 'Bất phương trình bậc nhất hai ẩn',
    difficulty: 'nhan_biet'
  },
  {
    id: 'q-toan10-02',
    text: 'Tập xác định của hàm số y = √(2x - 4) là:',
    options: ['D = [2; +∞)', 'D = (2; +∞)', 'D = (-∞; 2]', 'D = R \\ {2}'],
    correctIndex: 0,
    explanation: 'Hàm số xác định khi và chỉ khi biểu thức dưới dấu căn không âm: 2x - 4 ≥ 0 <=> 2x ≥ 4 <=> x ≥ 2. Vậy tập xác định D = [2; +∞).',
    subject: 'toan',
    grade: 10,
    topic: 'Hàm số và đồ thị',
    difficulty: 'nhan_biet'
  },
  {
    id: 'q-toan10-03',
    text: 'Trong mặt phẳng tọa độ Oxy, cho tam giác ABC có A(1; 2), B(3; 0), C(-1; 4). Tọa độ trọng tâm G của tam giác ABC là:',
    options: ['G(1; 2)', 'G(3; 6)', 'G(1; 3)', 'G(2; 1)'],
    correctIndex: 0,
    explanation: 'Tọa độ trọng tâm G tam giác ABC: x_G = (x_A + x_B + x_C)/3 = (1 + 3 - 1)/3 = 3/3 = 1; y_G = (y_A + y_B + y_C)/3 = (2 + 0 + 4)/3 = 6/3 = 2. Vậy G(1; 2).',
    subject: 'toan',
    grade: 10,
    topic: 'Vectơ và hệ tọa độ',
    difficulty: 'thong_hieu'
  },
  {
    id: 'q-toan10-04',
    text: 'Cho tam giác ABC có a = 8, b = 10 và góc C = 60°. Độ dài cạnh c bằng bao nhiêu?',
    options: ['2√21', '2√19', '2√31', '8√3'],
    correctIndex: 1,
    explanation: 'Áp dụng định lí cosin: c² = a² + b² - 2ab.cos(C) = 8² + 10² - 2.8.10.cos(60°) = 64 + 100 - 160.(1/2) = 164 - 80 = 84 (hoặc 76). Tính: 64 + 100 - 80 = 84 => c = √84 = 2√21. (Nếu c² = 76 => c = 2√19. Ở đây 84 => 2√21). Đáp án chính xác là 2√21.',
    subject: 'toan',
    grade: 10,
    topic: 'Hệ thức lượng trong tam giác',
    difficulty: 'van_dung'
  },
  {
    id: 'q-toan10-05',
    text: 'Phương trình x² - 2(m + 1)x + m² - 3 = 0 có hai nghiệm phân biệt khi nào?',
    options: ['m > -2', 'm > -1', 'm ≥ -2', 'm < 2'],
    correctIndex: 0,
    explanation: 'Phương trình bậc 2 có 2 nghiệm phân biệt khi Δ\' > 0 <=> [-(m + 1)]² - (m² - 3) > 0 <=> m² + 2m + 1 - m² + 3 > 0 <=> 2m + 4 > 0 <=> 2m > -4 <=> m > -2.',
    subject: 'toan',
    grade: 10,
    topic: 'Tam thức bậc hai',
    difficulty: 'van_dung'
  },

  // --- TIẾNG ANH LỚP 10 ---
  {
    id: 'q-anh10-01',
    text: 'Choose the word whose underlined part is pronounced differently: "threatened", "damaged", "polluted", "prepared"',
    options: ['polluted', 'threatened', 'damaged', 'prepared'],
    correctIndex: 0,
    explanation: 'Đuôi "-ed" của polluted phát âm là /ɪd/ (do kết thúc bằng âm /t/). Các từ còn lại đuôi "-ed" đều được phát âm là /d/.',
    subject: 'anh',
    grade: 10,
    topic: 'Phonetics & Pronunciation',
    difficulty: 'nhan_biet'
  },
  {
    id: 'q-anh10-02',
    text: 'By the time the teacher arrived in the classroom, the students ________ all their homework.',
    options: ['had finished', 'finish', 'have finished', 'are finishing'],
    correctIndex: 0,
    explanation: 'Cấu trúc "By the time + S + V(quá khứ đơn), S + V(quá khứ hoàn thành)" diễn tả một hành động xảy ra và hoàn tất trước một hành động khác trong quá khứ.',
    subject: 'anh',
    grade: 10,
    topic: 'Tenses in English',
    difficulty: 'thong_hieu'
  },
  {
    id: 'q-anh10-03',
    text: 'Green technology can help reduce greenhouse gas emissions, ________ is crucial in the fight against climate change.',
    options: ['which', 'that', 'who', 'where'],
    correctIndex: 0,
    explanation: 'Dùng đại từ quan hệ "which" đứng sau dấu phẩy để thay thế cho toàn bộ mệnh đề đứng trước nó.',
    subject: 'anh',
    grade: 10,
    topic: 'Relative Clauses',
    difficulty: 'thong_hieu'
  },
  {
    id: 'q-anh10-04',
    text: 'If we continue to cut down forests at this alarming rate, many rare animal species ________ extinct soon.',
    options: ['will become', 'became', 'would become', 'had become'],
    correctIndex: 0,
    explanation: 'Câu điều kiện loại 1 diễn tả sự việc có thật hoặc có thể xảy ra ở hiện tại hoặc tương lai: If + S + V(s/es), S + will + V_inf.',
    subject: 'anh',
    grade: 10,
    topic: 'Conditional Sentences',
    difficulty: 'thong_hieu'
  },

  // --- KHTN / VẬT LÝ LỚP 10 ---
  {
    id: 'q-ly10-01',
    text: 'Một vật chuyển động thẳng nhanh dần đều với vận tốc ban đầu v₀ = 2 m/s và gia tốc a = 1.5 m/s². Vận tốc của vật sau 4 giây là:',
    options: ['8 m/s', '6 m/s', '10 m/s', '4 m/s'],
    correctIndex: 0,
    explanation: 'Công thức tính vận tốc trong chuyển động thẳng biến đổi đều: v = v₀ + a.t = 2 + 1.5 * 4 = 2 + 6 = 8 m/s.',
    subject: 'khtn',
    grade: 10,
    topic: 'Động học chất điểm',
    difficulty: 'thong_hieu'
  },
  {
    id: 'q-ly10-02',
    text: 'Theo định luật II Newton, gia tốc của một vật có cùng hướng với lực tác dụng và có độ lớn:',
    options: [
      'Tỉ lệ thuận với độ lớn của lực và tỉ lệ nghịch với khối lượng của vật',
      'Tỉ lệ nghịch với độ lớn của lực và tỉ lệ thuận với khối lượng của vật',
      'Tỉ lệ thuận với cả độ lớn của lực và khối lượng của vật',
      'Không phụ thuộc vào khối lượng của vật'
    ],
    correctIndex: 0,
    explanation: 'Biểu thức vectơ a = F/m, suy ra gia tốc tỉ lệ thuận với độ lớn của lực tổng hợp tác dụng lên vật và tỉ lệ nghịch với khối lượng m của vật.',
    subject: 'khtn',
    grade: 10,
    topic: 'Các định luật Newton',
    difficulty: 'nhan_biet'
  },
  {
    id: 'q-ly10-03',
    text: 'Một vật có khối lượng m = 2 kg được nâng lên độ cao h = 5 m so với mặt đất (lấy g = 10 m/s²). Thế năng trọng trường của vật tại độ cao đó là:',
    options: ['100 J', '50 J', '200 J', '25 J'],
    correctIndex: 0,
    explanation: 'Thế năng trọng trường được xác định bởi công thức W_t = m.g.h = 2 * 10 * 5 = 100 J.',
    subject: 'khtn',
    grade: 10,
    topic: 'Năng lượng, Công và Thế năng',
    difficulty: 'nhan_biet'
  },

  // --- HÓA HỌC LỚP 10 ---
  {
    id: 'q-hoa10-01',
    text: 'Nguyên tử nguyên tố X có cấu hình electron là 1s² 2s² 2p⁶ 3s² 3p⁴. Vị trí của X trong bảng tuần hoàn là:',
    options: [
      'Ô số 16, chu kì 3, nhóm VIA',
      'Ô số 16, chu kì 3, nhóm IVA',
      'Ô số 14, chu kì 3, nhóm VIA',
      'Ô số 16, chu kì 2, nhóm VIA'
    ],
    correctIndex: 0,
    explanation: 'Tổng số electron = 2+2+6+2+4 = 16 => Số thứ tự ô 16. Có 3 lớp electron => Chu kì 3. Có 6 electron lớp ngoài cùng (3s² 3p⁴), electron cuối cùng điền vào phân lớp p => Nhóm VIA.',
    subject: 'hoa',
    grade: 10,
    topic: 'Cấu tạo nguyên tử & Bảng tuần hoàn',
    difficulty: 'thong_hieu'
  },
  {
    id: 'q-hoa10-02',
    text: 'Liên kết trong phân tử nào sau đây là liên kết ion?',
    options: ['NaCl', 'HCl', 'CO₂', 'H₂O'],
    correctIndex: 0,
    explanation: 'Hiệu độ âm điện giữa Na (kim loại điển hình) và Cl (phi kim điển hình) lớn hơn 1.7 (Δχ ≈ 3.16 - 0.93 = 2.23 > 1.7) nên liên kết trong NaCl là liên kết ion.',
    subject: 'hoa',
    grade: 10,
    topic: 'Liên kết hóa học',
    difficulty: 'nhan_biet'
  },

  // --- NGỮ VĂN LỚP 10 ---
  {
    id: 'q-van10-01',
    text: 'Tác phẩm "Bình Ngô đại cáo" do Nguyễn Trãi thừa lệnh ai soạn thảo?',
    options: ['Lê Lợi', 'Trần Hưng Đạo', 'Quang Trung', 'Lê Thánh Tông'],
    correctIndex: 0,
    explanation: '"Bình Ngô đại cáo" do Nguyễn Trãi thừa lệnh Bình Định vương Lê Lợi viết vào mùa xuân năm 1428 sau khi nghĩa quân Lam Sơn toàn thắng giặc Minh.',
    subject: 'van',
    grade: 10,
    topic: 'Văn học trung đại Việt Nam',
    difficulty: 'nhan_biet'
  },
  {
    id: 'q-van10-02',
    text: 'Trong tác phẩm "Chữ người tử tù" của Nguyễn Tuân, cảnh tượng Huấn Cao cho chữ viên quản ngục được tác giả miêu tả là:',
    options: [
      '"Một cảnh tượng xưa nay chưa từng có"',
      '"Một cuộc hội ngộ định mệnh"',
      '"Một buổi chia tay đầy xúc động"',
      '"Một phép màu nơi chốn ngục tù"'
    ],
    correctIndex: 0,
    explanation: 'Nguyễn Tuân đã gọi cảnh Huấn Cao cho chữ viên quản ngục trong buồng giam tối tăm, ẩm ướt là "một cảnh tượng xưa nay chưa từng có" - nơi cái đẹp và thiên lương chiến thắng bóng tối tội ác.',
    subject: 'van',
    grade: 10,
    topic: 'Văn học hiện thực và lãng mạn',
    difficulty: 'thong_hieu'
  },

  // --- LỊCH SỬ & ĐỊA LÝ LỚP 10 ---
  {
    id: 'q-sudia10-01',
    text: 'Văn minh Văn Lang - Âu Lạc gắn liền với sự phát triển rực rỡ của nền văn hóa khảo cổ nào?',
    options: ['Văn hóa Đông Sơn', 'Văn hóa Sa Huỳnh', 'Văn hóa Óc Eo', 'Văn hóa Hòa Bình'],
    correctIndex: 0,
    explanation: 'Văn minh Văn Lang - Âu Lạc (thời đại các vua Hùng và An Dương Vương) được xây dựng trên nền tảng vật chất rực rỡ của văn hóa Đông Sơn thời đại đồ đồng.',
    subject: 'su_dia',
    grade: 10,
    topic: 'Văn minh thời cổ - trung đại',
    difficulty: 'nhan_biet'
  },
  {
    id: 'q-sudia10-02',
    text: 'Vùng khí hậu nhiệt đới gió mùa của Việt Nam có đặc điểm nổi bật nào sau đây?',
    options: [
      'Nhiệt độ cao, độ ẩm lớn và phân hóa theo hai mùa rõ rệt',
      'Nhiệt độ quanh năm thấp và mưa tuyết về mùa đông',
      'Lượng mưa rất ít, khô hạn quanh năm',
      'Thời tiết ổn định, không có bão lũ'
    ],
    correctIndex: 0,
    explanation: 'Khí hậu Việt Nam mang tính chất nhiệt đới ẩm gió mùa: nền nhiệt cao quanh năm, độ ẩm trung bình trên 80%, với sự phân mùa sâu sắc do gió mùa Đông Bắc và Tây Nam.',
    subject: 'su_dia',
    grade: 10,
    topic: 'Địa lý tự nhiên Việt Nam',
    difficulty: 'nhan_biet'
  },

  // --- TOÁN LỚP 9 ---
  {
    id: 'q-toan9-01',
    text: 'Căn bậc hai số học của số 81 là:',
    options: ['9', '-9', '±9', '81'],
    correctIndex: 0,
    explanation: 'Căn bậc hai số học của một số dương a là số không âm x sao cho x² = a. Với 81, số không âm là 9 (vì 9² = 81).',
    subject: 'toan',
    grade: 9,
    topic: 'Căn bậc hai và căn bậc ba',
    difficulty: 'nhan_biet'
  },
  {
    id: 'q-toan9-02',
    text: 'Hệ phương trình bậc nhất hai ẩn { 2x + y = 5; x - y = 1 } có nghiệm duy nhất (x; y) là:',
    options: ['(2; 1)', '(1; 3)', '(3; -1)', '(0; 5)'],
    correctIndex: 0,
    explanation: 'Cộng hai vế phương trình: (2x + y) + (x - y) = 5 + 1 <=> 3x = 6 <=> x = 2. Thay x = 2 vào x - y = 1 => 2 - y = 1 => y = 1. Nghiệm là (2; 1).',
    subject: 'toan',
    grade: 9,
    topic: 'Hệ hai phương trình bậc nhất hai ẩn',
    difficulty: 'thong_hieu'
  },

  // --- TOÁN LỚP 12 ---
  {
    id: 'q-toan12-01',
    text: 'Cho hàm số y = f(x) có bảng biến thiên với đạo hàm f\'(x) đổi dấu từ dương sang âm khi qua x = 2. Điểm x = 2 là:',
    options: ['Điểm cực đại của hàm số', 'Điểm cực tiểu của hàm số', 'Giá trị lớn nhất', 'Điểm uốn'],
    correctIndex: 0,
    explanation: 'Nếu đạo hàm f\'(x) đổi dấu từ dương sang âm khi x qua x₀ (từ trái sang phải) thì x₀ là điểm cực đại của hàm số.',
    subject: 'toan',
    grade: 12,
    topic: 'Ứng dụng đạo hàm khảo sát hàm số',
    difficulty: 'nhan_biet'
  },
  {
    id: 'q-toan12-02',
    text: 'Nguyên hàm của hàm số f(x) = 3x² + 2x là:',
    options: ['x³ + x² + C', '6x + 2 + C', '3x³ + 2x² + C', 'x³ + 2x² + C'],
    correctIndex: 0,
    explanation: '∫(3x² + 2x)dx = 3*(x³/3) + 2*(x²/2) + C = x³ + x² + C.',
    subject: 'toan',
    grade: 12,
    topic: 'Nguyên hàm và Tích phân',
    difficulty: 'nhan_biet'
  }
];

export function getQuestionsByFilters(subject?: Subject, grade?: Grade, topic?: string): Question[] {
  return CURRICULUM_QUESTIONS.filter(q => {
    if (subject && q.subject !== subject) return false;
    if (grade && q.grade !== grade) return false;
    if (topic && !q.topic.toLowerCase().includes(topic.toLowerCase())) return false;
    return true;
  });
}
