import { createSelector } from 'reselect';
import worldPaths from 'app/data/world-50m-paths';
import { PATH_LAYERS } from 'app/data/constants';
import uniq from 'lodash/uniq';

const getResultsData = state => state.data || [];
const getLoading = state => state.loading || null;
const getDocument = state => state.search.document || null;
export const getTotalCountriesNumber = state =>
  (state.countriesData && state.countriesData.length) || null;

export const getTotalDocumentsNumber = createSelector(
  [state => state.meta, getDocument],
  (meta, document) => {
    if (!meta) return null;
    return document && document !== 'all'
      ? meta[`total_${document}_count`]
      : meta.total_ndc_count + meta.total_indc_count;
  }
);

const getIncludedDocumentsResults = createSelector(
  [getResultsData, getDocument],
  (results, document) => {
    if (!results || !results.length) return [];
    return document && document !== 'all'
      ? results.filter(result => result.document_type === document)
      : results;
  }
);

const getIncludedCountries = createSelector(
  [getIncludedDocumentsResults],
  results => {
    if (!results || !results.length) return [];
    return uniq(results.map(result => result.location.iso_code3));
  }
);

export const getIncludedDocumentsCount = createSelector(
  [getIncludedDocumentsResults],
  documents => (documents ? documents.length : null)
);

export const getIncludedCountriesCount = createSelector(
  [getIncludedDocumentsResults],
  results => {
    if (!results) return null;
    return uniq(results.map(result => result.location.iso_code3)).length;
  }
);

const countryStyle = {
  default: {
    fill: '#b1b1c1',
    fillOpacity: 0.3,
    stroke: '#ffffff',
    strokeWidth: 0.3,
    outline: 'none'
  },
  hover: {
    fill: '#25597c',
    stroke: '#ffffff',
    strokeWidth: 0.3,
    outline: 'none'
  },
  pressed: {
    fill: '#b1b1c1',
    stroke: '#ffffff',
    strokeWidth: 0.3,
    outline: 'none'
  }
};

const activeCountryStyle = {
  ...countryStyle,
  default: {
    ...countryStyle.default,
    fill: '#25597c',
    fillOpacity: 0.9
  },
  hover: {
    ...countryStyle.hover,
    fill: '#25597c',
    fillOpacity: 1
  }
};

export const getPathsWithStyles = createSelector(
  [getIncludedCountries, getLoading],
  (countriesIncluded, loading) => {
    const paths = [];
    worldPaths.forEach(path => {
      if (path.properties.layer !== PATH_LAYERS.ISLANDS) {
        const iso = path.properties && path.properties.id;
        const isCountryIncluded = countriesIncluded.includes(iso);
        paths.push({
          ...path,
          style:
            isCountryIncluded && !loading ? activeCountryStyle : countryStyle
        });
      }
    });
    return paths;
  }
);

export default {
  getIncludedDocumentsCount,
  getIncludedCountriesCount,
  getPathsWithStyles,
  getTotalCountriesNumber
};
