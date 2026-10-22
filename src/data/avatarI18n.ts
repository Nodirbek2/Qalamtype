import type { Language } from '../types';

const words = {
  uzbek_latin: { choose: 'Tayyor avatarlar', hint: 'Bittasini tanlang yoki galereyangizdan rasm yuklang.', upload: 'Galereyadan yuklash', saved: 'Avatar saqlandi', pick: 'Avatar', accuracy: 'aniqlik' },
  uzbek_cyrillic: { choose: 'Тайёр аватарлар', hint: 'Биттасини танланг ёки галереянгиздан расм юкланг.', upload: 'Галереядан юклаш', saved: 'Аватар сақланди', pick: 'Аватар', accuracy: 'аниқлик' },
  russian: { choose: 'Готовые аватары', hint: 'Выберите аватар или загрузите своё фото.', upload: 'Загрузить из галереи', saved: 'Аватар сохранён', pick: 'Аватар', accuracy: 'точность' },
  english: { choose: 'Choose an avatar', hint: 'Pick a character or upload your own photo.', upload: 'Upload from gallery', saved: 'Avatar saved', pick: 'Avatar', accuracy: 'accuracy' },
};
export function avatarText(language: Language) { return words[language] || words.uzbek_latin; }
