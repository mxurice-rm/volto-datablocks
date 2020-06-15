import { useState, useEffect, useRef } from 'react';
import { connect } from 'react-redux';

import { addAppURL } from '@plone/volto/helpers';
import { getDataFromProvider } from 'volto-datablocks/actions';
import {
  getConnectedDataParametersForProvider,
  getConnectedDataParametersForContext,
  getConnectedDataParametersForPath,
} from 'volto-datablocks/helpers';
import { formatValue } from 'volto-datablocks/format';

import '../css/styles.css';

const EMPTY = '^';

const usePrevious = value => {
  const ref = useRef();
  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref.current;
};

const getValue = (
  data,
  column,
  filters,
  filterIndex = 0,
  placeholder = EMPTY,
) => {
  /*
   * Data is an object like: {
   * AV_P_SIZE: [501.78255, 849.335, 339.9433, 733.36331, 742.50659]
   * COUNTRY: ["Albania", "Austria", "Belgium", ]
   *
   * Filters is an array of objects like:
   * {
   * i: "COUNTRY"
   * o: "plone.app.querystring.operation.selection.any"
   * v: ["BG"] }
   */
  // TODO: we implement now a very simplistic filtering, with only one type of
  // filter and only one filter is taken into consideration
  if (!(filters && filters[filterIndex]))
    console.log(
      'This DataConnectedValue is used in a context without parameters',
    );
  if (!data || (!filters || !filters?.[filterIndex])) return placeholder;
  const filter = filters[filterIndex];
  const { i: index, v: values } = filter; // o: op,

  if (!values || values.length === 0) return placeholder;

  // asuming that op is "plone.app.querystring.operation.selection.any"
  const value = values[0];
  if (!data[index]) {
    console.log('NOT_AN_INDEX_IN_DATA:', index, data);
    return placeholder;
  }
  const pos = data[index].indexOf(value);

  if (pos === -1) {
    console.log(`No value found in data for "${value}" in column "${index}"`);
    return placeholder;
  }
  return (data[column] && data[column][pos]) || placeholder;
};

const DataEntity = props => {
  const {
    column,
    connected_data_parameters,
    filterIndex,
    format,
    placeholder,
    data_providers,
    pathname,
    url,
  } = props;
  // provider_data: getProviderData(state, props),
  const [state, setState] = useState({
    firstDataProviderUpdate: true,
  });
  const prevUrl = usePrevious(url);
  const data_provider = url
    ? data_providers?.data?.[`${url}/@connector-data`] ||
      data_providers?.data?.[`${addAppURL(url)}/@connector-data`]
    : [];
  if (
    __CLIENT__ &&
    !data_provider &&
    ((prevUrl && prevUrl !== url) || (url && state.firstDataProviderUpdate))
  ) {
    url &&
      state.firstDataProviderUpdate &&
      setState({
        ...state,
        firstDataProviderUpdate: false,
      });
    props.getDataFromProvider(url);
  }
  const dataParameters =
    getConnectedDataParametersForProvider(connected_data_parameters, url) ||
    getConnectedDataParametersForContext(connected_data_parameters, pathname) ||
    getConnectedDataParametersForPath(connected_data_parameters, pathname);

  const value = getValue(
    data_provider,
    column,
    dataParameters,
    filterIndex,
    placeholder,
  );

  return formatValue(value, format);
};

export default connect(
  (state, props) => ({
    data_providers: state.data_providers,
    content: state.content.data,
    pathname: state.router.location.pathname,
    connected_data_parameters: state.connected_data_parameters,
  }),
  {
    getDataFromProvider,
  },
)(DataEntity);
