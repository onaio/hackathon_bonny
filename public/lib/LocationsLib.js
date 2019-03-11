// Location Default Setting Store
const locationsLib = {};

// Afghanistan
locationsLib['AF'] = {
  label: 'Afghanistan',
  center: [63.79, 33.98],
  zoom: 5.2
};

locationsLib['AF-Herat'] = {
  label: 'Herat',
  center: {
    lng: 62.19225048645524,
    lat: 34.346309101680774
  },
  zoom: 12.351050113472233
};

locationsLib['AF-Kabul'] = {
  label: 'Kabul',
  zoom: 10.695873279884117,
  center: {
    lng: 69.13155473084771,
    lat: 34.50960383103761
  }
}

export default locationsLib;
