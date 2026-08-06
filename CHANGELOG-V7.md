# Changelog — Living Aquarium V7

## 7.0.0 — Deep Sea Expedition

### Added

- отдельная точка входа `v7.html` поверх проверенного V6 runtime;
- четыре глубоководных района с разной глубиной, энергозатратами и риском;
- батискаф с энергией, прочностью корпуса и научными комплектами;
- переключаемый сонар, снижающий вероятность аварии;
- 12 типов научных образцов;
- XP, бортовой журнал и статистика погружений;
- пять достижений Deep Sea Expedition;
- постепенное открытие районов по прогрессу экспедиций;
- отдельное сохранение `aquarium-v7-deep-sea`.

### Infrastructure

- добавлены отдельные CI, tag и release workflows линии V7;
- `v7-runtime-test.js` проверяет совместимость overlay с V6;
- release workflow собирает V6 runtime и V7 overlay в единый portable `index.html`;
- публикуются Portable ZIP, Source ZIP и SHA-256 checksums.
