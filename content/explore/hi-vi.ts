/**
 * Explore content for Hindi-native users learning Vietnamese.
 * All descriptive text is in Hindi so the reader can understand it.
 * Phrases show Vietnamese (target) + Hindi meaning.
 */

import type { ExploreContent } from './vi-hi'

export const hiViExplore: ExploreContent = {
  cultureCards: [
    {
      emoji: '🌿',
      title: 'वियतनाम — हरे-भरे चावल के खेतों का देश',
      body:
        'वियतनाम दक्षिण-पूर्व एशिया का एक खूबसूरत देश है जो अपनी हरी-भरी पहाड़ियों, चावल की सीढ़ीदार खेती और 3,000 किमी लंबी समुद्री तटरेखा के लिए प्रसिद्ध है। देश का 70% भाग पहाड़ी है।',
    },
    {
      emoji: '🛵',
      title: 'मोटरबाइक — वियतनाम का दिल',
      body:
        'वियतनाम में 5 करोड़ से ज़्यादा मोटरबाइक हैं। हनोई और हो ची मिन्ह सिटी की सड़कों पर मोटरबाइकों की भीड़ देखना एक अविश्वसनीय अनुभव है — यातायात की अपनी एक धारा बनती रहती है।',
    },
    {
      emoji: '🍜',
      title: 'फ़ो (Phở) — राष्ट्रीय व्यंजन',
      body:
        'फ़ो वियतनाम का सबसे प्रसिद्ध व्यंजन है — चावल के नूडल, मांस और सुगंधित शोरबे का यह सूप नाश्ते में भी खाया जाता है। इसे "फ़uh" की तरह उच्चारित करते हैं, न कि "foe"।',
    },
    {
      emoji: '🎋',
      title: 'तेत (Tết) — वियतनामी नव वर्ष',
      body:
        'तेत वियतनाम का सबसे बड़ा त्योहार है, जो चंद्र नव वर्ष के साथ मनाया जाता है (जनवरी–फरवरी)। लोग घरों को गेंदे के फूलों और आड़ू के पेड़ों से सजाते हैं, बड़ों को पैसे देते हैं और पूर्वजों की पूजा करते हैं।',
    },
    {
      emoji: '🏯',
      title: 'होई अन — प्राचीन व्यापार नगर',
      body:
        'होई अन (Hội An) 15वीं–19वीं सदी का एक बंदरगाह शहर है जो UNESCO विश्व धरोहर में शामिल है। यहाँ की पीली दीवारें, लालटेनें और नहरें इसे दुनिया के सबसे खूबसूरत शहरों में से एक बनाती हैं।',
    },
    {
      emoji: '☕',
      title: 'वियतनामी कॉफ़ी — दुनिया की सबसे मज़बूत',
      body:
        'वियतनाम दुनिया का दूसरा सबसे बड़ा कॉफ़ी निर्यातक है। "Cà phê sữa đá" (बर्फ वाली दूध कॉफ़ी) वहाँ की पहचान है। एक अनोखी विशेषता है "Cà phê trứng" — अंडे की जर्दी से बनी कॉफ़ी जो हनोई में मिलती है।',
    },
  ],

  phraseCategories: [
    {
      icon: '👋',
      name: 'अभिवादन',
      phrases: [
        { target: 'Xin chào', native: 'नमस्ते / नमस्कार' },
        { target: 'Chào bạn', native: 'हेलो (दोस्त को)' },
        { target: 'Bạn có khỏe không?', native: 'आप कैसे हैं?' },
        { target: 'Tôi khỏe, cảm ơn', native: 'मैं ठीक हूँ, धन्यवाद' },
        { target: 'Tên bạn là gì?', native: 'आपका नाम क्या है?' },
        { target: 'Tên tôi là ...', native: 'मेरा नाम ... है' },
        { target: 'Tạm biệt', native: 'अलविदा / फिर मिलेंगे' },
        { target: 'Chúc ngủ ngon', native: 'शुभ रात्रि' },
      ],
    },
    {
      icon: '🔢',
      name: 'संख्याएँ',
      phrases: [
        { target: 'một', native: 'एक (1)' },
        { target: 'hai', native: 'दो (2)' },
        { target: 'ba', native: 'तीन (3)' },
        { target: 'bốn', native: 'चार (4)' },
        { target: 'năm', native: 'पाँच (5)' },
        { target: 'mười', native: 'दस (10)' },
        { target: 'hai mươi', native: 'बीस (20)' },
        { target: 'một trăm', native: 'सौ (100)' },
      ],
    },
    {
      icon: '🍽️',
      name: 'खाना-पीना',
      phrases: [
        { target: 'Phở', native: 'फ़ो (नूडल सूप)' },
        { target: 'Cơm', native: 'चावल / भोजन' },
        { target: 'Nước', native: 'पानी' },
        { target: 'Cà phê', native: 'कॉफ़ी' },
        { target: 'Ngon lắm!', native: 'बहुत स्वादिष्ट!' },
        { target: 'Tôi đói', native: 'मुझे भूख लगी है' },
        { target: 'Tính tiền', native: 'बिल लाइए' },
        { target: 'Ăn chay', native: 'शाकाहारी' },
      ],
    },
    {
      icon: '🚌',
      name: 'यातायात',
      phrases: [
        { target: '... ở đâu?', native: '... कहाँ है?' },
        { target: 'Bên trái', native: 'बाएँ' },
        { target: 'Bên phải', native: 'दाएँ' },
        { target: 'Đi thẳng', native: 'सीधे जाइए' },
        { target: 'Dừng lại', native: 'रुकिए' },
        { target: 'Bao xa?', native: 'कितना दूर है?' },
        { target: 'Xe ôm', native: 'मोटरबाइक टैक्सी' },
      ],
    },
    {
      icon: '🆘',
      name: 'आपातकाल',
      phrases: [
        { target: 'Cứu tôi!', native: 'मदद करो!' },
        { target: 'Gọi bác sĩ', native: 'डॉक्टर बुलाओ' },
        { target: 'Gọi cảnh sát', native: 'पुलिस बुलाओ' },
        { target: 'Tôi bị lạc', native: 'मैं खो गया हूँ' },
        { target: 'Xin lỗi', native: 'माफ़ करें / क्षमा करें' },
      ],
    },
  ],
}
