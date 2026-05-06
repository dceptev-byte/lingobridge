/**
 * Explore content for Vietnamese-native users learning Hindi.
 * All descriptive text is in Vietnamese so the reader can understand it.
 * Phrases show Hindi (target) + Vietnamese meaning.
 */

export interface CultureCard {
  emoji: string
  title: string   // in reader's native lang (VI)
  body: string    // in reader's native lang (VI)
}

export interface Phrase {
  target: string       // Hindi phrase
  targetRoman?: string // IAST / informal romanisation
  native: string       // Vietnamese meaning
}

export interface PhraseCategory {
  icon: string
  name: string   // in reader's native lang (VI)
  phrases: Phrase[]
}

export interface ExploreContent {
  cultureCards: CultureCard[]
  phraseCategories: PhraseCategory[]
}

export const viHiExplore: ExploreContent = {
  cultureCards: [
    {
      emoji: '🕌',
      title: 'Ấn Độ — xứ sở của ngàn ngôn ngữ',
      body:
        'Ấn Độ có hơn 22 ngôn ngữ chính thức và hàng trăm phương ngữ. Hindi là ngôn ngữ phổ biến nhất với khoảng 600 triệu người sử dụng, chủ yếu ở miền Bắc và miền Trung Ấn Độ.',
    },
    {
      emoji: '🙏',
      title: 'Namaste — lời chào mang ý nghĩa sâu sắc',
      body:
        '"Namaste" (नमस्ते) không chỉ là lời chào — nó có nghĩa là "Tôi kính trọng thần thánh trong bạn." Được thực hiện bằng cách chắp hai tay trước ngực và cúi đầu nhẹ.',
    },
    {
      emoji: '🍛',
      title: 'Ẩm thực Ấn Độ đa dạng vùng miền',
      body:
        'Mỗi vùng của Ấn Độ có ẩm thực riêng biệt. Miền Bắc nổi tiếng với bánh naan và cà ri, miền Nam ưa chuộng dosa và cơm. Gia vị là linh hồn của mọi món ăn Ấn.',
    },
    {
      emoji: '🎭',
      title: 'Bollywood — nền điện ảnh lớn nhất thế giới',
      body:
        'Bollywood (Mumbai) sản xuất hơn 1.800 bộ phim mỗi năm — nhiều hơn Hollywood. Phim Bollywood nổi tiếng với các cảnh ca múa hoành tráng, thường kết hợp tiếng Hindi và tiếng Anh.',
    },
    {
      emoji: '🐄',
      title: 'Bò — loài vật linh thiêng',
      body:
        'Trong đạo Hindu, bò được coi là linh thiêng và không bị giết thịt. Bạn sẽ thấy bò đi lại tự do trên đường phố tại nhiều thành phố Ấn Độ — đây là điều hoàn toàn bình thường.',
    },
    {
      emoji: '🌙',
      title: 'Lễ hội Diwali — Tết ánh sáng',
      body:
        'Diwali là lễ hội lớn nhất của người Hindu, kéo dài 5 ngày. Mọi người thắp đèn dầu (diyas), bắn pháo hoa và trao nhau đồ ngọt. Đây là dịp gia đình sum họp và tôn thờ nữ thần Lakshmi — thần may mắn và giàu có.',
    },
  ],

  phraseCategories: [
    {
      icon: '👋',
      name: 'Chào hỏi',
      phrases: [
        { target: 'नमस्ते', targetRoman: 'Namaste', native: 'Xin chào / Chào' },
        { target: 'नमस्कार', targetRoman: 'Namaskar', native: 'Xin chào (trang trọng)' },
        { target: 'आप कैसे हैं?', targetRoman: 'Aap kaise hain?', native: 'Bạn có khoẻ không?' },
        { target: 'मैं ठीक हूँ', targetRoman: 'Main theek hoon', native: 'Tôi khoẻ' },
        { target: 'आपका नाम क्या है?', targetRoman: 'Aapka naam kya hai?', native: 'Tên bạn là gì?' },
        { target: 'मेरा नाम ... है', targetRoman: 'Mera naam ... hai', native: 'Tên tôi là ...' },
        { target: 'फिर मिलेंगे', targetRoman: 'Phir milenge', native: 'Hẹn gặp lại' },
        { target: 'शुभ रात्रि', targetRoman: 'Shubh ratri', native: 'Chúc ngủ ngon' },
      ],
    },
    {
      icon: '🔢',
      name: 'Số đếm',
      phrases: [
        { target: 'एक', targetRoman: 'Ek', native: 'Một (1)' },
        { target: 'दो', targetRoman: 'Do', native: 'Hai (2)' },
        { target: 'तीन', targetRoman: 'Teen', native: 'Ba (3)' },
        { target: 'चार', targetRoman: 'Chaar', native: 'Bốn (4)' },
        { target: 'पाँच', targetRoman: 'Paanch', native: 'Năm (5)' },
        { target: 'दस', targetRoman: 'Das', native: 'Mười (10)' },
        { target: 'बीस', targetRoman: 'Bees', native: 'Hai mươi (20)' },
        { target: 'सौ', targetRoman: 'Sau', native: 'Một trăm (100)' },
      ],
    },
    {
      icon: '🍽️',
      name: 'Ăn uống',
      phrases: [
        { target: 'खाना', targetRoman: 'Khaana', native: 'Thức ăn / Cơm' },
        { target: 'पानी', targetRoman: 'Paani', native: 'Nước' },
        { target: 'चाय', targetRoman: 'Chaay', native: 'Trà (Chai)' },
        { target: 'बहुत अच्छा है', targetRoman: 'Bahut achha hai', native: 'Rất ngon' },
        { target: 'मुझे भूख लगी है', targetRoman: 'Mujhe bhookh lagi hai', native: 'Tôi đói' },
        { target: 'बिल लाइए', targetRoman: 'Bill laiye', native: 'Cho tôi hóa đơn' },
        { target: 'शाकाहारी', targetRoman: 'Shaakaahaari', native: 'Chay (ăn chay)' },
      ],
    },
    {
      icon: '🚌',
      name: 'Di chuyển',
      phrases: [
        { target: 'कहाँ है?', targetRoman: 'Kahaan hai?', native: '... ở đâu?' },
        { target: 'बाएँ', targetRoman: 'Baayen', native: 'Bên trái' },
        { target: 'दाएँ', targetRoman: 'Daayen', native: 'Bên phải' },
        { target: 'सीधे जाइए', targetRoman: 'Seedhe jaiye', native: 'Đi thẳng' },
        { target: 'रुकिए', targetRoman: 'Rukiye', native: 'Dừng lại' },
        { target: 'कितना दूर है?', targetRoman: 'Kitna door hai?', native: 'Xa bao nhiêu?' },
        { target: 'टैक्सी', targetRoman: 'Taxi', native: 'Taxi' },
      ],
    },
    {
      icon: '🆘',
      name: 'Khẩn cấp',
      phrases: [
        { target: 'मदद करो!', targetRoman: 'Madad karo!', native: 'Cứu tôi với!' },
        { target: 'डॉक्टर बुलाओ', targetRoman: 'Doctor bulao', native: 'Gọi bác sĩ' },
        { target: 'पुलिस बुलाओ', targetRoman: 'Police bulao', native: 'Gọi cảnh sát' },
        { target: 'मैं खो गया हूँ', targetRoman: 'Main kho gaya hoon', native: 'Tôi bị lạc' },
        { target: 'क्षमा करें', targetRoman: 'Kshama karen', native: 'Xin lỗi' },
      ],
    },
  ],
}
