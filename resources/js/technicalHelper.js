let technicalHelper = {
  parseFormData(data) {
    let indexed_array = {};

    $.map(data, function (item) {
      let mustBeArray = false;
      if (item['name'].match(/\[\]$/g)) {
        item['name'] = item['name'].replace('[]', '');
        mustBeArray = true;
      }

      if (indexed_array[item['name']]) {
        if (Array.isArray(indexed_array[item['name']])) {
          indexed_array[item['name']].push(item['value']);
        } else {
          indexed_array[item['name']] = [indexed_array[item['name']], item['value']];
        }
      } else {
        if (mustBeArray) {
          indexed_array[item['name']] = [item['value']];
        } else {
          indexed_array[item['name']] = item['value'];
        }
      }
    });

    return indexed_array;
  },

  // растягивает заготовку "занавески" под занавешиваемый элемент и делает "занавеску" видимой
  blindItem(blockedElement,  blindElement) {
    let blindWidth = blockedElement.css('width');
    let blindHeight = blockedElement.css('height');
    blindElement.css({'width': blindWidth, 'height':blindHeight, 'z-index': 100}).removeClass('hidden');
  },

};
export default technicalHelper;