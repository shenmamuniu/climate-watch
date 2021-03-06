import { createSelector, createStructuredSelector } from 'reselect';
import { getColorByIndex } from 'utils/map';
import { isEmpty, orderBy } from 'lodash';
import { format } from 'd3-format';
import worldPaths from 'app/data/world-50m-paths';
import {
  PATH_LAYERS,
  AGRICULTURE_INDICATORS_NAMES,
  AGRICULTURE_INDICATORS_MAP_BUCKETS
} from 'app/data/constants';

const countryStyles = {
  default: {
    fill: '#e9e9e9',
    fillOpacity: 1,
    stroke: '#f5f6f7',
    strokeWidth: 1,
    outline: 'none'
  },
  hover: {
    fill: '#e9e9e9',
    fillOpacity: 1,
    stroke: '#f5f6f7',
    strokeWidth: 1,
    outline: 'none'
  },
  pressed: {
    fill: '#e9e9e9',
    fillOpacity: 1,
    stroke: '#f5f6f7',
    strokeWidth: 1,
    outline: 'none'
  }
};

export const MAP_COLORS = [
  ['#0677B3', '#1ECDB0'],
  ['#0677B3', '#1ECDB0', '#00A0CA'],
  ['#0677B3', '#00B4D2', '#00A0CA', '#0677B3'],
  ['#00B4D2', '#00A0CA', '#0677B3', '#045480']
];

const getSearch = state => state.search || null;
const getCountries = state => state.countries || null;
const getAgricultureData = ({ agricultureCountriesContexts }) =>
  (agricultureCountriesContexts && agricultureCountriesContexts.data) || null;
const getAgricultureMeta = ({ agricultureCountriesContexts }) =>
  (agricultureCountriesContexts && agricultureCountriesContexts.meta) || null;

const getIndicatorsParsed = createSelector(getAgricultureMeta, meta => {
  if (!meta) return [];
  const indicators = meta.map(i => ({
    value: i.short_name.toLowerCase(),
    label: AGRICULTURE_INDICATORS_NAMES[i.short_name.toLowerCase()],
    filter: 'contextMapIndicator',
    unit: i.unit || '%'
  }));
  return orderBy(indicators, 'label');
});

export const getSelectedIndicator = createSelector(
  [getIndicatorsParsed, getSearch],
  (indicators, search) => {
    if (isEmpty(indicators)) return null;
    if (search && !search.contextMapIndicator) return indicators[0];
    return indicators.find(i => i.value === search.contextMapIndicator);
  }
);

const getYears = createSelector(getAgricultureData, data => {
  if (!data) return null;
  const years = data.map(d => d.year);
  const uniqueYears = [...new Set(years)];
  return uniqueYears.sort((a, b) => b - a).map(y => ({
    label: y.toString(),
    value: y.toString()
  }));
});

export const getSelectedYear = createSelector(
  [getYears, getSearch],
  (years, search) => {
    if (isEmpty(years)) return null;
    if (search && !search.indicatorYear) return years[0];
    return years.find(y => y.value === search.indicatorYear);
  }
);

const getBucketIndex = (indicator, value) => {
  if (
    indicator === 'total_fertilizers' ||
    indicator === 'total_pesticides_use'
  ) {
    if (!value) return 0;
    if (value < 10) return 1;
    if (value < 100) return 2;
    if (value < 1000) return 3;
    return 4;
  }
  if (!value) return 0;
  if (value < 5) return 1;
  if (value < 20) return 2;
  if (value < 50) return 3;
  return 4;
};

export const getMapData = createSelector(
  [getSelectedIndicator, getSelectedYear, getAgricultureData],
  (indicator, year, data) => {
    if (!indicator || !year) return null;
    return data.filter(d => d.year === parseInt(year.value, 10)).map(l => ({
      iso: l.iso_code3,
      value: l[indicator.value],
      unit: indicator.unit,
      bucketIndex: getBucketIndex(indicator.value, l[indicator.value])
    }));
  }
);

const indicatorValueFormat = (value, unit) => {
  if (!value) return 'No Data';
  if (unit === '%' || !unit) return `${Math.round(value * 10) / 10}`;
  return `${format(',.2s')(value)}`;
};

const getWidth = (value, maxValue) => value * 100 / maxValue;

export const getTopTenCountries = createSelector(
  [getMapData, getCountries, getSelectedIndicator],
  data => {
    if (!data) return null;
    return data
      .slice()
      .filter(d => d.value)
      .sort((a, b) => b.value - a.value)
      .filter(c => c.iso !== 'WORLD')
      .filter(c => c.iso !== 'SAR')
      .slice(0, 10);
  }
);

export const getTopTenConfig = createSelector(
  [getTopTenCountries, getCountries, getSelectedIndicator],
  (data, countries, selectedIndicator) => {
    if (!data || !countries || !selectedIndicator) return null;
    const values = data.map(d => d.value);
    const maxValue = Math.max(...values);
    return data.map(d => ({
      ...d,
      label:
        countries.find(c => c.value === d.iso) &&
        countries.find(c => c.value === d.iso).label,
      valueLabel: indicatorValueFormat(d.value, d.unit),
      chartWidth: getWidth(d.value, maxValue),
      color: getColorByIndex(
        AGRICULTURE_INDICATORS_MAP_BUCKETS[selectedIndicator.value],
        d.bucketIndex,
        MAP_COLORS
      )
    }));
  }
);

export const getPathsWithStyles = createSelector(
  [getSelectedIndicator, getMapData],
  (selectedIndicator, mapData) => {
    if (!selectedIndicator) return [];
    const paths = [];
    worldPaths.forEach(path => {
      if (path.properties.layer !== PATH_LAYERS.ISLANDS) {
        if (!mapData) {
          paths.push({
            ...path,
            countryStyles
          });
          return null;
        }

        const iso = path.properties && path.properties.id;
        const countryData = mapData.filter(c => c.iso === iso);

        let style = countryStyles;
        if (!isEmpty(countryData)) {
          const color = getColorByIndex(
            AGRICULTURE_INDICATORS_MAP_BUCKETS[selectedIndicator.value],
            countryData[0].bucketIndex,
            MAP_COLORS
          );
          style = {
            ...countryStyles,
            default: {
              ...countryStyles.default,
              fill: color,
              fillOpacity: 1
            },
            hover: {
              ...countryStyles.hover,
              fill: color,
              fillOpacity: 1
            }
          };
        }

        paths.push({
          ...path,
          style
        });
      }
      return null;
    });
    return paths;
  }
);

export const getMapLegend = createSelector(getSelectedIndicator, indicator => {
  if (!indicator) return {};
  return AGRICULTURE_INDICATORS_MAP_BUCKETS[indicator.value];
});

export const countriesContexts = createStructuredSelector({
  indicators: getIndicatorsParsed,
  selectedIndicator: getSelectedIndicator,
  indicatorsYears: getYears,
  indicatorSelectedYear: getSelectedYear,
  paths: getPathsWithStyles,
  legend: getMapLegend,
  mapData: getMapData,
  topTenCountries: getTopTenConfig
});
