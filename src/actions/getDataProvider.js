import { flattenToAppURL } from '@plone/volto/helpers';
import {
  GET_DATA_FROM_PROVIDER,
  SET_CONNECTED_DATA_PARAMETERS,
  DELETE_CONNECTED_DATA_PARAMETERS,
} from 'volto-datablocks/constants';
import qs from 'query-string';

export function getDataFromProvider(path, filters = null, queryString = '') {
  path =
    typeof path === 'object'
      ? Array.isArray(path) && path.length
        ? path[0]['@id']
        : path['@id']
      : path;
  path = path && flattenToAppURL(path).replace(/\/$/, '');
  if (!path)
    return {
      type: GET_DATA_FROM_PROVIDER,
    };
  return filters
    ? {
        type: GET_DATA_FROM_PROVIDER,
        path: path,
        request: {
          op: 'post',
          path: `${path}/@connector-data/`,
          data: { query: filters },
        },
      }
    : {
        type: GET_DATA_FROM_PROVIDER,
        path: path,
        queryString: queryString,
        request: {
          op: 'get',
          path: `${path}/@connector-data/${queryString}`,
          params: {
            ...qs.parse(queryString),
          },
        },
      };
}

export function setConnectedDataParameters(
  path,
  parameters,
  index,
  manuallySet = false,
) {
  return {
    type: SET_CONNECTED_DATA_PARAMETERS,
    path,
    parameters,
    index,
    manuallySet,
  };
}

export function deleteConnectedDataParameters(path, index) {
  return {
    type: DELETE_CONNECTED_DATA_PARAMETERS,
    path,
    index,
  };
}
