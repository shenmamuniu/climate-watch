import { createSelector } from 'reselect';
import remove from 'lodash/remove';
import isEmpty from 'lodash/isEmpty';
import isArray from 'lodash/isArray';
import pick from 'lodash/pick';
import qs from 'query-string';
import { parseQuery } from 'utils/data-explorer';
import { findEqual } from 'utils/utils';
import sortBy from 'lodash/sortBy';
import {
  DATA_EXPLORER_BLACKLIST,
  DATA_EXPLORER_METHODOLOGY_SOURCE,
  DATA_EXPLORER_FILTERS,
  SOURCE_VERSIONS,
  DATA_EXPLORER_SECTION_BASE_URIS,
  DATA_EXPLORER_EXTERNAL_PREFIX,
  DATA_EXPLORER_TO_MODULES_PARAMS
} from 'data/constants';

const getMeta = state => state.meta || null;
const getSection = state => state.section || null;
const getSearch = state => state.search || null;
const getCountries = state => state.countries || null;
const getRegions = state => state.regions || null;

export const getData = createSelector(
  [state => state.data, getSection],
  (data, section) => {
    if (!data || !section) return null;
    return (data && data[section] && data[section].data) || null;
  }
);

export const getSourceOptions = createSelector(
  [getMeta, getSection],
  (meta, section) => {
    if (
      !meta ||
      isEmpty(meta) ||
      !section ||
      section !== 'historical-emissions' ||
      !meta[section]
    ) {
      return null;
    }
    return SOURCE_VERSIONS.map(option => {
      const data_source = meta[section].data_sources.find(
        s => s.name === option.data_source_slug
      );
      const version = meta[section].gwps.find(
        s => s.name === option.version_slug
      );
      const updatedOption = option;
      updatedOption.data_source_id = data_source && data_source.id;
      updatedOption.version_id = version && version.id;
      return updatedOption;
    });
  }
);

const removeFiltersPrefix = (selectedFields, prefix) => {
  const fieldsWithoutPrefix = {};
  Object.keys(selectedFields).forEach(k => {
    const keyWithoutPrefix = k.replace(`${prefix}-`, '');
    fieldsWithoutPrefix[keyWithoutPrefix] = selectedFields[k];
  });
  return fieldsWithoutPrefix;
};

export const getFilterQuery = createSelector(
  [getMeta, getSearch, getSection],
  (meta, search, section) => {
    if (!meta || isEmpty(meta) || !section) return null;
    const metadata = meta[section];
    if (!metadata) return null;
    const parsedFilters = removeFiltersPrefix(search, section);
    const filterIds = {};
    Object.keys(parsedFilters).forEach(key => {
      const parsedKey = key.replace('-', '_');
      const filter =
        metadata[parsedKey] &&
        metadata[parsedKey].find(option =>
          findEqual(
            option,
            [
              'name',
              'value',
              'wri_standard_name',
              'cw_title',
              'slug',
              'number'
            ],
            parsedFilters[key]
          )
        );
      filterIds[parsedKey] = filter && (filter.id || filter.iso_code3);
    });
    return filterIds;
  }
);

export const parseFilterQuery = createSelector([getFilterQuery], filterIds => {
  if (!filterIds || isEmpty(filterIds)) return null;
  const filterQuery = qs.stringify(filterIds);
  return filterQuery && parseQuery(filterQuery);
});

export const getLink = createSelector(
  [getFilterQuery, getSection, state => state.meta],
  (filterQuery, section, meta) => {
    if (!section) return null;
    const parsedQuery = {};
    if (filterQuery && !isEmpty(filterQuery)) {
      Object.keys(filterQuery).forEach(key => {
        const parsedKeyData = DATA_EXPLORER_TO_MODULES_PARAMS[section][key];
        const parsedKey = parsedKeyData && parsedKeyData.key;
        if (parsedKey) {
          const { idLabel } = parsedKeyData;
          const id = idLabel
            ? meta[section][key].find(m => m.id === filterQuery[key])[idLabel]
            : filterQuery[key];
          parsedQuery[parsedKey] = id;
        }
      });
    }
    const stringifiedQuery = qs.stringify(parsedQuery);
    const urlParameters = stringifiedQuery ? `?${stringifiedQuery}` : '';
    return `/${DATA_EXPLORER_SECTION_BASE_URIS[section]}${urlParameters}`;
  }
);

export const getFilterOptions = createSelector(
  [getMeta, getSection, getCountries, getRegions, getSourceOptions],
  (meta, section, countries, regions, sourceVersions) => {
    if (!section || isEmpty(meta)) return null;
    const filterKeys = DATA_EXPLORER_FILTERS[section];
    const filtersMeta = meta[section];

    if (!filtersMeta) return null;
    if (filterKeys.includes('regions')) filtersMeta.regions = regions;
    if (filterKeys.includes('countries')) filtersMeta.countries = countries;
    if (filterKeys.includes('source')) {
      filtersMeta.source = sourceVersions;
    }
    const filterOptions = {};
    filterKeys.forEach(f => {
      const options = filtersMeta[f];
      if (options) {
        const parsedOptions = options.map(option => {
          const slug =
            option.slug ||
            option.name ||
            option.value ||
            option.wri_standard_name ||
            option.number;
          let label =
            option.name ||
            option.value ||
            option.wri_standard_name ||
            option.cw_title ||
            option.number;
          if (f === 'goals') label = `${option.number}: ${label}`;
          return {
            slug,
            value: label,
            label,
            ...option
          };
        });
        filterOptions[f] = parsedOptions;
      }
    });
    return filterOptions;
  }
);

const parseOptions = options => {
  const groupParents = [];
  const finalOptions = options
    .map(option => {
      const updatedOption = option;
      if (!option.parent_id) {
        updatedOption.groupParent = option.name;
        groupParents.push({ parentId: option.id, name: option.name });
      }
      return updatedOption;
    })
    .map(option => {
      const updatedOption = option;
      if (option.parent_id) {
        updatedOption.group = groupParents.find(
          o => option.parent_id === o.parentId
        ).name;
      }
      return updatedOption;
    });
  return sortBy(finalOptions, 'label');
};

const parseGroupsInOptions = createSelector(
  [getFilterOptions, getSection],
  (options, section) => {
    const MULTIPLE_LEVEL_SECTIONS = { 'ndc-content': ['sectors'] };
    if (
      !options ||
      !section ||
      MULTIPLE_LEVEL_SECTIONS[section] === undefined
    ) {
      return options;
    }
    const updatedOptions = options;
    Object.keys(options).forEach(key => {
      if (MULTIPLE_LEVEL_SECTIONS[section].includes(key)) {
        updatedOptions[key] = parseOptions(updatedOptions[key]);
      }
    });
    return updatedOptions;
  }
);

const mergeSourcesAndVersions = filters => {
  const dataSourceFilter = filters['data-sources'];
  let versionFilter = filters.gwps;
  const updatedFilters = filters;
  if (dataSourceFilter) {
    if (dataSourceFilter === 'CAIT') versionFilter = 'AR2'; // Remove when GHG emissions has the correct version options
    updatedFilters.source = `${dataSourceFilter} - ${versionFilter}`;
    delete updatedFilters['data-sources'];
    delete updatedFilters.gwps;
  }
  return updatedFilters;
};

export const parseExternalParams = createSelector(
  [getSearch, getSection, getFilterOptions, state => state.meta],
  (search, section, filterOptions, meta) => {
    if (!search || !section || !filterOptions || !meta) return null;
    const selectedFields = search;
    const selectedKeys = Object.keys(selectedFields).filter(k =>
      k.startsWith(`${DATA_EXPLORER_EXTERNAL_PREFIX}-${section}`)
    );
    if (selectedKeys.length < 1) return null;
    const externalFields = pick(selectedFields, selectedKeys);
    const parsedFields = {};
    Object.keys(externalFields).forEach(k => {
      const keyWithoutPrefix = k
        .replace(`${DATA_EXPLORER_EXTERNAL_PREFIX}-`, '')
        .replace(`${section}-`, '');
      const metaMatchingKey = keyWithoutPrefix.replace('-', '_');
      if (metaMatchingKey !== 'undefined') {
        const possibleLabelFields = [
          'name',
          'value',
          'wri_standard_name',
          'slug',
          'number',
          'cw_title'
        ];
        const labelObject = meta[section][metaMatchingKey].find(
          i =>
            i.id === parseInt(externalFields[k], 10) ||
            i.number === externalFields[k]
        );
        const label = possibleLabelFields.find(
          f => labelObject && labelObject[f]
        );
        parsedFields[k.replace(`${DATA_EXPLORER_EXTERNAL_PREFIX}-`, '')] =
          labelObject[label];
      }
    });
    return parsedFields;
  }
);

const getSelectedFilters = createSelector(
  [getSearch, getSection, getFilterOptions],
  (search, section, filterOptions) => {
    if (!search || !section || !filterOptions) return null;
    const selectedFields = search;
    const nonExternalKeys = Object.keys(selectedFields).filter(
      k => !k.startsWith(DATA_EXPLORER_EXTERNAL_PREFIX)
    );
    const selectedKeys = nonExternalKeys.filter(k => k.startsWith(section));
    const sectionRelatedFields = pick(selectedFields, selectedKeys);
    const parsedSelectedFilters = mergeSourcesAndVersions(
      removeFiltersPrefix(sectionRelatedFields, section)
    );
    const selectedFilterObjects = {};
    Object.keys(parsedSelectedFilters).forEach(filterKey => {
      selectedFilterObjects[filterKey] = filterOptions[filterKey].find(
        f => f.slug === parsedSelectedFilters[filterKey]
      );
    });
    return selectedFilterObjects;
  }
);

export const getFilteredOptions = createSelector(
  [parseGroupsInOptions, getSection, getSelectedFilters],
  (options, section, selectedFilters) => {
    const FILTERED_FIELDS = {
      'historical-emissions': {
        sectors: {
          parent: 'source',
          id: 'data_source_id'
        }
      },
      'ndc-sdg-linkages': {
        targets: {
          parent: 'goals',
          parentId: 'id',
          id: 'goal_id'
        }
      },
      'ndc-content': {
        indicators: {
          parent: 'categories',
          parentId: 'id',
          id: 'category_ids'
        }
      }
    };
    if (
      !section ||
      !FILTERED_FIELDS[section] ||
      !selectedFilters ||
      isEmpty(selectedFilters) ||
      FILTERED_FIELDS[section] === undefined
    ) {
      return options;
    }
    const updatedOptions = { ...options };
    Object.keys(updatedOptions).forEach(key => {
      const filterableKeys = Object.keys(FILTERED_FIELDS[section]);
      if (filterableKeys.includes(key)) {
        updatedOptions[key] = updatedOptions[key].filter(i => {
          const parentIdLabel =
            FILTERED_FIELDS[section][key].parentId ||
            FILTERED_FIELDS[section][key].id;
          const idLabelToFilterBy = FILTERED_FIELDS[section][key].id;
          const fieldParent = FILTERED_FIELDS[section][key].parent;
          const selectedId = selectedFilters[fieldParent][parentIdLabel];
          return isArray(i[idLabelToFilterBy])
            ? i[idLabelToFilterBy].includes(selectedId)
            : i[idLabelToFilterBy] === selectedId;
        });
      }
    });
    return updatedOptions;
  }
);

export const getMethodology = createSelector(
  [getMeta, getSection, getSelectedFilters],
  (meta, section, selectedfilters) => {
    const sectionHasSources = section === 'historical-emissions';
    if (
      !meta ||
      isEmpty(meta) ||
      !section ||
      (sectionHasSources &&
        (isEmpty(selectedfilters) || !selectedfilters.source))
    ) {
      return null;
    }
    const methodology = meta.methodology;
    let metaSource = DATA_EXPLORER_METHODOLOGY_SOURCE[section];
    if (sectionHasSources) {
      const source = selectedfilters.source.data_source_slug;
      metaSource = DATA_EXPLORER_METHODOLOGY_SOURCE[section][source];
    }
    return methodology.filter(s => metaSource.includes(s.source));
  }
);

export const getSelectedOptions = createSelector(
  [getSelectedFilters],
  selectedFields => {
    if (!selectedFields) return null;
    const selectedOptions = {};
    Object.keys(selectedFields).forEach(key => {
      selectedOptions[key] = {
        value: selectedFields[key].label || selectedFields[key].slug,
        label: selectedFields[key].label,
        id: selectedFields[key].id ||
        selectedFields[key].iso_code3 || [
          selectedFields[key].data_source_id,
          selectedFields[key].version_id
        ]
      };
    });
    return selectedOptions;
  }
);

export const parseData = createSelector([getData], data => {
  if (!data || !data.length) return null;
  let updatedData = data;
  if (updatedData[0].emissions) {
    updatedData = updatedData.map(d => {
      const yearEmissions = {};
      d.emissions.forEach(e => {
        yearEmissions[e.year] = e.value;
      });
      return { ...d, ...yearEmissions };
    });
  }
  const whiteList = remove(
    Object.keys(updatedData[0]),
    n => DATA_EXPLORER_BLACKLIST.indexOf(n) === -1
  );
  return updatedData.map(d => pick(d, whiteList));
});
