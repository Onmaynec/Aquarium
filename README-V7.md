# Living Aquarium V7 — Deep Sea Expedition

V7 расширяет стабильное ядро Living Aquarium V6 отдельным модулем глубоководных экспедиций. Откройте `v7.html` или GitHub Pages-путь `/Aquarium/v7.html`.

## Новое

- четыре района: Сумеречный риф, Каньон сирен, Абиссальная равнина и Термальные источники;
- батискаф с энергией, прочностью корпуса и научными комплектами;
- активный сонар, уменьшающий риск погружения;
- 12 типов научных образцов, XP Ocean Lab и бортовой журнал;
- пять достижений и постепенное открытие глубоководных зон;
- горячая клавиша `X`;
- отдельное сохранение `aquarium-v7-deep-sea`, не изменяющее слоты V6.

## Запуск

Откройте `v7.html` через локальный HTTP-сервер либо используйте Portable ZIP релиза `v7.0.0`.

```bash
python -m http.server 8080
```

Затем перейдите на `http://localhost:8080/v7.html`.

## Проверки

```bash
node --check v7-expedition.js
node --check bootstrap-v7.js
node tests/deep-sea-overlay-test.js
node tests/v7-runtime-test.js
```

V7 использует проверенный runtime V6 как базовый слой и подключает Deep Sea Expedition после запуска основного симулятора.
