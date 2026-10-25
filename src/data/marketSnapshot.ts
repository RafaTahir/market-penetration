// Historical World Bank series mirrored by DataHub; never a live/API fallback.
// Raw numeric literals are preserved without display rounding or inferred values.
// Provenance, extraction checks and limitations: docs/FLOW_MARKET_SNAPSHOT.md.

export interface MarketFundamental {
  population: number;
  gdpUsd: number;
  gdpSeries: { year: number; value: number }[];
}

export const MARKET_SNAPSHOT_META = {
  observationYear: 2023,
  retrievedAt: '2026-10-25T17:48:56Z',
  source: 'World Bank series via DataHub',
  population: {
    indicator: 'SP.POP.TOTL',
    unit: 'people',
    commit: 'd4b1a4a9a17e2123baf0ef119de05bceced1ab1b',
    downloadUrl: 'https://raw.githubusercontent.com/datasets/population/d4b1a4a9a17e2123baf0ef119de05bceced1ab1b/data/population.csv',
    sha256: '2c697c3e668c8cb06ee467cd0d475b37b52844fdc48cb7725b79b58f18bf0b02',
    upstreamUrl: 'https://data.worldbank.org/indicator/SP.POP.TOTL',
    license: { name: 'ODC-PDDL-1.0', url: 'https://opendatacommons.org/licenses/pddl/' },
  },
  gdp: {
    indicator: 'NY.GDP.MKTP.CD',
    unit: 'current US dollars',
    commit: '36d761dc5617982d3e50b213e02b9a1b47c4e958',
    downloadUrl: 'https://raw.githubusercontent.com/datasets/gdp/36d761dc5617982d3e50b213e02b9a1b47c4e958/data/gdp.csv',
    sha256: '8d84ef6bcaccf740c01c5ed7566aae8f7b149d0e2c20001e441efd3cb5b2fa86',
    upstreamUrl: 'https://data.worldbank.org/indicator/NY.GDP.MKTP.CD',
    license: { name: 'CC-BY-4.0', url: 'https://creativecommons.org/licenses/by/4.0/' },
  },
} as const;

export const MARKET_FUNDAMENTALS: Record<string, MarketFundamental> = {
  THA: {
    population: 71702435,
    gdpUsd: 514944993833.5776,
    gdpSeries: [
      { year: 2014, value: 407339040197.65125 },
      { year: 2015, value: 401296238228.0839 },
      { year: 2016, value: 413366349747.5081 },
      { year: 2017, value: 456356813536.7637 },
      { year: 2018, value: 506754208404.4847 },
      { year: 2019, value: 543976691793.88586 },
      { year: 2020, value: 500461898480.24554 },
      { year: 2021, value: 506256494297.33966 },
      { year: 2022, value: 495645210972.7507 },
      { year: 2023, value: 514944993833.5776 },
    ],
  },
  SGP: {
    population: 5917648,
    gdpUsd: 501427500080.05853,
    gdpSeries: [
      { year: 2014, value: 314863580758.45465 },
      { year: 2015, value: 307998545269.39795 },
      { year: 2016, value: 319053943915.0054 },
      { year: 2017, value: 343257164581.71155 },
      { year: 2018, value: 376892697588.00507 },
      { year: 2019, value: 376901649222.4508 },
      { year: 2020, value: 349488382610.662 },
      { year: 2021, value: 434111559282.8491 },
      { year: 2022, value: 498474540987.7802 },
      { year: 2023, value: 501427500080.05853 },
    ],
  },
  MYS: {
    population: 35126298,
    gdpUsd: 399648828546.5043,
    gdpSeries: [
      { year: 2014, value: 338066095097.2544 },
      { year: 2015, value: 301355266964.9473 },
      { year: 2016, value: 301256033870.33356 },
      { year: 2017, value: 319109094160.3431 },
      { year: 2018, value: 358788845712.5297 },
      { year: 2019, value: 365177721021.5161 },
      { year: 2020, value: 337456163961.2112 },
      { year: 2021, value: 373832428055.4486 },
      { year: 2022, value: 407027451714.61597 },
      { year: 2023, value: 399648828546.5043 },
    ],
  },
  IDN: {
    population: 281190067,
    gdpUsd: 1371171152331.155,
    gdpSeries: [
      { year: 2014, value: 890814755533.5369 },
      { year: 2015, value: 860854232686.2139 },
      { year: 2016, value: 931877364037.6975 },
      { year: 2017, value: 1015618744159.7339 },
      { year: 2018, value: 1042271532988.6317 },
      { year: 2019, value: 1119099871350.1992 },
      { year: 2020, value: 1059054842698.482 },
      { year: 2021, value: 1186509691086.7307 },
      { year: 2022, value: 1319076267310.162 },
      { year: 2023, value: 1371171152331.155 },
    ],
  },
  PHL: {
    population: 114891199,
    gdpUsd: 437146372729.94244,
    gdpSeries: [
      { year: 2014, value: 297483555344.8018 },
      { year: 2015, value: 306445871246.7178 },
      { year: 2016, value: 318627003012.5201 },
      { year: 2017, value: 328480736798.7918 },
      { year: 2018, value: 346841896583.5147 },
      { year: 2019, value: 376823402244.9279 },
      { year: 2020, value: 361751145451.59674 },
      { year: 2021, value: 394087359848.11 },
      { year: 2022, value: 404353369604.6311 },
      { year: 2023, value: 437146372729.94244 },
    ],
  },
  VNM: {
    population: 100352192,
    gdpUsd: 429716969049.5928,
    gdpSeries: [
      { year: 2014, value: 233451469642.51938 },
      { year: 2015, value: 239258328381.7414 },
      { year: 2016, value: 257096001177.98184 },
      { year: 2017, value: 281353605986.90344 },
      { year: 2018, value: 310106478394.6589 },
      { year: 2019, value: 334365270496.66705 },
      { year: 2020, value: 346615738537.7963 },
      { year: 2021, value: 366474752771.00934 },
      { year: 2022, value: 410324028883.32526 },
      { year: 2023, value: 429716969049.5928 },
    ],
  },
};
