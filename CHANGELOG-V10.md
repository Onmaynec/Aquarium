# Changelog — Living Aquarium V10

## 10.0.0 — Ocean Command Center

### Added

- отдельный Ocean Command Center с клавишей `C` и storage key `aquarium-v10-command`;
- Ocean Index в диапазоне 0–100;
- флот из трёх судов и до трёх параллельных миссий;
- пять регионов с порогами влияния и разным риском;
- пять операций реального времени с кредитами, разведданными и снабжением;
- пять специалистов с уровнями 1–5;
- стабилизационная программа для прямого повышения Ocean Index;
- шесть достижений и оперативный журнал;
- одноразовый legacy-бонус по данным V7–V9;
- `v10.html`, V10 PWA-конфигурация, tests и release builder.

### Changed

- release-сборка объединяет overlays V7–V10 поверх V6 runtime;
- Service Worker обслуживает V10 app shell и не должен удалять посторонние кэши origin;
- навигация использует network-first с offline fallback.

### Compatibility

- V6 и overlays V7–V9 не изменяются;
- предыдущие storage keys читаются только при расчёте наследия;
- прогресс командного центра полностью изолирован.
