import React, { Component } from 'react';
import { connect } from 'react-redux';
import { getDataFromProvider } from '../actions';
import { addAppURL } from '@plone/volto/helpers';

export class BlockView extends Component {
  componentWillMount() {
    if (this.props.data.connector_path)
      this.props.getDataFromProvider(
        this.props.data.connector_path,
        this.props.properties.data_query,
      );
  }

  componentDidUpdate(prevProps) {
    if (this.props.data.connector_path !== prevProps.data.connector_path) {
      this.props.getDataFromProvider(
        this.props.data.connector_path,
        this.props.properties.data_query,
      );
    }
  }

  render() {
    console.log('props', this.props);
    return (
      <div className="data-connected-block">
        <div>{this.props.data.connector_path}</div>
      </div>
    );
  }
}

function getProviderData(state, props) {
  if (!props.data.connector_path) return {};

  const url = `${addAppURL(props.data.connector_path)}/@connector-data`;
  const data = state.data_providers.data || {};
  return data[url];
}

export default connect(
  (state, props) => ({
    provider_data: getProviderData(state, props),
  }),
  {
    getDataFromProvider,
  },
)(BlockView);
