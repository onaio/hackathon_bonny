import { generateFilterOptions, processFilters } from 'gisida';





// A function for creating filterOptions based on filters {...} from component state
// to be used in conjunction with initial sectorObj.filterOptions to regenerate filters
// when re-rendering Filter component UI. Custom / Quant filters can then update this
// to effectively extend into / update the fillter state.
export default function buildFilterState(filterOptions, filters, sectorObj, isOr) {
  const aggregate = {
    filter: [],
    'accepted-filter-values': [],
    'filter-label': [],
    // 'sub-filter': [],
    // 'accepted-sub-filter-values': [],
    // 'sub-filter-label': [],
  };

  const filterKeys = Object.keys(filters);
  let filterKey;
  let filter;

  let option;
  let optionKeys;

  for (let f = 0; f < filterKeys.length; f += 1) {
    filterKey = filterKeys[f];

    filter = filters[filterKey];
    aggregate.filter[f] = filterKey;
    aggregate['accepted-filter-values'][f] = filter.queriedOptionKeys
      && filter.queriedOptionKeys.length
      ? filter.queriedOptionKeys : [];

    aggregate['filter-label'][f] = filter.label || '';

    if (filter.isFiltered && filter.dataType === 'ordinal') {
      const { options } = filter;
      optionKeys = Object.keys(options);
      for (let o = 0; o < optionKeys.length; o += 1) {
        option = options[optionKeys[o]];

        if (((filter.isOriginal || filter.isFiltered) && option.enabled)
          || ((!filter.isOriginal && !filter.isFiltered) && option.count)) {
          aggregate['accepted-filter-values'][f].push(optionKeys[o]);
        }
      }
      if (optionKeys.length === aggregate['accepted-filter-values'][f].length) {
        aggregate['accepted-filter-values'][f] = 'all';
      }
    // } else if (dataType === 'quantitative') {
    //   aggregate['accepted-filter-values'][f] = filter.isFiltered ?
    } else if (filter.dataType === 'quantitative') {
      aggregate['accepted-filter-values'][f] = filter.queriedOptionKeys
        && filter.queriedOptionKeys.length !== [...new Set(filter.options)].length
        ? filter.queriedOptionKeys
        : 'quant';
    } else if (!filter.isFiltered) {
      // if (filters[filterKey].isOriginal) {
      aggregate['accepted-filter-values'][f] = filter.dataType === 'ordinal' ? 'all' : 'quant';
    }
  }

  const originalsectorObj = {
    ...sectorObj,
    source: {
      ...sectorObj.source,
      data: Array.isArray(sectorObj.source.data)
        ? [...sectorObj.source.data]
        : { ...sectorObj.source.data },
    },
    mergedData: [
      ...sectorObj.source.data
    ],
    aggregate: {
      ...sectorObj.aggregate,
      ...aggregate,
    },
    filterOptions: {
      ...sectorObj.filterOptions,
    },
    filters: {
      ...sectorObj.filters,
    },
  };


  const fauxsectorObj = {
    ...sectorObj,
    source: {
      ...sectorObj.source,
      data: Array.isArray(sectorObj.source.data)
        ? [...sectorObj.source.data]
        : { ...sectorObj.source.data },
    },
    mergedData: [
      ...sectorObj.source.data
    ],
    aggregate: {
      ...sectorObj.aggregate,
      ...aggregate,
    },
    filterOptions: {
      ...sectorObj.filterOptions,
    }
  };
  fauxsectorObj.source.data = processFilters(fauxsectorObj, null, isOr);
  fauxsectorObj.mergedData = [
    ...fauxsectorObj.source.data,
  ];
 
  
  return {
    filters,
    filterOptions,
    aggregate,
    isFiltered: true,
    fauxsectorObj,
    originalsectorObj,
  };

}