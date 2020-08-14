/* REACT */
import React, { useState, useRef, useEffect } from 'react';
import { Grid, Dropdown, Radio } from 'semantic-ui-react';
// import { options, sites, quickFacts, tableItems } from './browseConstants';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { setQueryParam } from 'volto-datablocks/actions';
import qs from 'query-string';
import jsonp from 'jsonp';
/* OPEN LAYERS */
import 'ol/ol.css';
// import EsriJSON from 'ol/format/EsriJSON';
// import { Tile as TileLayer, Vector as VectorLayer, Group } from 'ol/layer';
// import { tile as tileStrategy } from 'ol/loadingstrategy';
// import { fromLonLat } from 'ol/proj';
// import VectorSource from 'ol/source/Vector';
// import XYZ from 'ol/source/XYZ';
// import { Fill, Stroke, Style, Circle as CircleStyle } from 'ol/style';
// import { createXYZ } from 'ol/tilegrid';

import './style.css';

const popupData = {
  show: false,
};

const renderMap = props => {
  const { draggable, queryParameters } = props;
  setTimeout(() => {
    if (
      __CLIENT__ &&
      document &&
      document.getElementById('map') &&
      document.getElementById('popup-content') &&
      document.getElementById('popup') &&
      document.getElementById('popup-closer')
    ) {
      document.getElementById('map').innerHTML = '';
      const Map = require('ol/Map').default;
      const View = require('ol/View').default;
      const Overlay = require('ol/Overlay').default;
      const EsriJSON = require('ol/format/EsriJSON').default;
      const VectorSource = require('ol/source/Vector').default;
      const XYZ = require('ol/source/XYZ').default;
      const { fromLonLat } = require('ol/proj');
      const { createXYZ } = require('ol/tilegrid');
      const CircleStyle = require('ol/style/Circle.js').default;
      const Fill = require('ol/style/Fill.js').default;
      const Stroke = require('ol/style/Stroke.js').default;
      const Style = require('ol/style/Style.js').default;
      const TileLayer = require('ol/layer/Tile.js').default;
      const VectorLayer = require('ol/layer/Vector.js').default;
      const Group = require('ol/layer/Group.js').default;
      const { tile } = require('ol/loadingstrategy');
      const tileStrategy = tile;

      /**
       * Elements that make up the popup.
       */
      var element = document.getElementById('popup');

      // Main map
      var map = new Map({
        target: document.getElementById('map'),
        view: new View({
          center: fromLonLat([20, 50]),
          zoom: 4.5,
        }),
      });

      /**
       * Create an overlay to anchor the popup to the map.
       */
      var popup = new Overlay({
        element: element,
        positioning: 'bottom-center',
        stopEvent: false,
      });
      map.addOverlay(popup);

      // Basemaps Layers
      const worldLightGrayBase = new TileLayer({
        source: new XYZ({
          url:
            'https://server.arcgisonline.com/ArcGIS/rest/services/' +
            'Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}',
        }),
        visible: true,
        title: 'World_Light_Gray_Base',
      });

      const worldHillshade = new TileLayer({
        source: new XYZ({
          url:
            'https://server.arcgisonline.com/ArcGIS/rest/services/' +
            'Elevation/World_Hillshade/MapServer/tile/{z}/{y}/{x}',
        }),
        visible: false,
        title: 'World_Hillshade',
      });

      // Base Layer Group
      const baseLayerGroup = new Group({
        layers: [worldLightGrayBase, worldHillshade],
      });
      map.addLayer(baseLayerGroup);

      // Layer Switcher logic for Basemaps
      const baseLayerElements = document.querySelectorAll(
        '.sidebar > input[type=radio]',
      );
      for (let baseLayerElement of baseLayerElements) {
        baseLayerElement.addEventListener('change', function() {
          let baseLayerElementValue = this.value;
          baseLayerGroup.getLayers().forEach(function(element, index, array) {
            let baseLayerTitle = element.get('title');
            element.setVisible(baseLayerTitle === baseLayerElementValue);
          });
        });
      }

      // Vector Layers
      var esrijsonFormat = new EsriJSON();

      // ly_IED_SiteMap_WM
      const filterIEDSiteMapWM = { where: '' };
      const vectorSourceIEDSiteMapWM = new VectorSource({
        loader: function(extent, resolution, projection) {
          var url =
            'https://services.arcgis.com/LcQjj2sL7Txk9Lag/arcgis/rest/services/ly_IED_SiteMap_WM/FeatureServer/0/query/?f=json&' +
            'returnGeometry=true&spatialRel=esriSpatialRelIntersects&geometry=' +
            encodeURIComponent(
              '{"xmin":' +
                extent[0] +
                ',"ymin":' +
                extent[1] +
                ',"xmax":' +
                extent[2] +
                ',"ymax":' +
                extent[3] +
                ',"spatialReference":{"wkid":102100}}',
            ) +
            '&geometryType=esriGeometryEnvelope&inSR=102100&outFields=*' +
            '&outSR=102100';
          jsonp(url, { ...filterIEDSiteMapWM }, (error, response) => {
            if (error) {
              console.log(error.message);
            } else {
              var features = esrijsonFormat.readFeatures(response, {
                featureProjection: projection,
              });
              console.dir(response);
              if (features.length > 0) {
                vectorSourceIEDSiteMapWM.addFeatures(features);
              }
            }
          });
        },
        strategy: tileStrategy(
          createXYZ({
            tileSize: 512,
          }),
        ),
      });
      const lyIEDSiteMapWM = new VectorLayer({
        source: vectorSourceIEDSiteMapWM,
        style: new Style({
          image: new CircleStyle({
            radius: 3,
            fill: new Fill({ color: '#666666' }),
            stroke: new Stroke({ color: '#bada55', width: 1 }),
          }),
        }),
        visible: true,
        title: 'ly_IED_SiteMap_WM',
      });

      // IED_SiteClusters_WM
      const vectorSourceIEDSiteClustersWM = new VectorSource({
        loader: function(extent, resolution, projection) {
          var url =
            'https://services.arcgis.com/LcQjj2sL7Txk9Lag/ArcGIS/rest/services/ly_IED_SiteClusters_WM/FeatureServer/0/query/?f=json' +
            '&returnGeometry=true&spatialRel=esriSpatialRelIntersects&geometry=' +
            encodeURIComponent(
              '{"xmin":' +
                extent[0] +
                ',"ymin":' +
                extent[1] +
                ',"xmax":' +
                extent[2] +
                ',"ymax":' +
                extent[3] +
                ',"spatialReference":{"wkid":102100}}',
            ) +
            '&geometryType=esriGeometryEnvelope&inSR=102100&outFields=*' +
            '&outSR=102100';
          jsonp(url, null, (error, response) => {
            if (error) {
              console.log(error.message);
            } else {
              var features = esrijsonFormat.readFeatures(response, {
                featureProjection: projection,
              });
              if (features.length > 0) {
                vectorSourceIEDSiteClustersWM.addFeatures(features);
              }
            }
          });
        },
        strategy: tileStrategy(
          createXYZ({
            tileSize: 512,
          }),
        ),
      });

      const lyIEDSiteClustersWM = new VectorLayer({
        source: vectorSourceIEDSiteClustersWM,
        style: new Style({
          image: new CircleStyle({
            radius: 3,
            fill: new Fill({ color: '#dd1111' }),
            stroke: new Stroke({ color: '#bada55', width: 1 }),
          }),
        }),
        visible: true,
        title: 'ly_IED_SiteClusters_WM',
      });

      // Vector Layer Group
      const vectorLayerGroup = new Group({
        layers: [lyIEDSiteMapWM, lyIEDSiteClustersWM],
      });
      map.addLayer(vectorLayerGroup);

      // Auto center by client location
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(centerPosition);
      }

      function centerPosition(position) {
        map
          .getView()
          .setCenter(
            fromLonLat([position.coords.longitude, position.coords.latitude]),
          );
        map.getView().setZoom(12);
      }

      // Identify logic
      var displayFeatureInfo = function(pixel) {
        var features = [];
        map.forEachFeatureAtPixel(pixel, function(feature) {
          features.push(feature);
        });
        if (features.length > 0) {
          map.getTarget().style.cursor = 'pointer';
          var geometry = features[0].getGeometry();
          var coord = geometry.getCoordinates();

          let content = '';
          let title = '';

          if (features[0].get('sitename')) {
            console.dir(features[0]);
            title = features[0].get('sitename');
            content = '<h5>Site contents:</h5>';
            content += features[0].get('n_fac') + ' Facilities<br>';
            content +=
              features[0].get('n_lcp') + ' Large combustion plants<br>';
            content = '<h5>Pollutant emissions</h5>';
            content += features[0].get('pollutants') + '<br>';
            content += '<h5>Regulatory information</h5>';
            content += 'Last operating permit issued: [DATA NOT AVAILABLE]<br>';
            content +=
              'Inspections in ' +
              features[0].get('rep_yr') +
              ': ' +
              features[0].get('n_inspect') +
              '<br>';
          }

          if (features[0].get('NUTS_NAME')) {
            title = features[0].get('NUTS_NAME');
            content = ' NUTS Region: ' + features[0].get('NUTS_NAME') + '<br>';
            content += ' Country: ' + features[0].get('COUNTRY') + '<br>';
            content +=
              ' Number of sites: ' + features[0].get('num_sites') + '<br>';
          }
          setTimeout(() => {
            console.log('HERE', document.getElementById('popup'));
            console.log('HERE content', content);
            popup.setPosition(coord);

            // element.popover({
            //   placement: 'right',
            //   html: true,
            //   title: features[0].get('sitename'),
            //   content: content,
            // });
            // element.popover('show');

            // document.getElementById('popup-content').innerHTML = content;
          }, 0);
        } else {
          map.getTarget().style.cursor = '';
          popup.setPosition(undefined);
          // $(element).popover('destroy');
        }
      };

      map.on('pointermove', function(evt) {
        if (evt.dragging) {
          return;
        }
        var pixel = map.getEventPixel(evt.originalEvent);
        displayFeatureInfo(pixel);
      });

      map.on('click', function(evt) {
        displayFeatureInfo(evt.pixel);
      });

      // zoom-in out layer switching logic
      let currZoom = map.getView().getZoom();
      map.on('moveend', function(e) {
        console.log('moveend');
        let newZoom = map.getView().getZoom();
        if (currZoom !== newZoom) {
          if (newZoom > 8) {
            lyIEDSiteMapWM.setVisible(true);
            lyIEDSiteClustersWM.setVisible(false);
          } else {
            lyIEDSiteMapWM.setVisible(false);
            lyIEDSiteClustersWM.setVisible(true);
          }
          currZoom = newZoom;
        }
      });
    }
  }, 0);
};

const OpenlayersMapView = props => {
  const { query } = qs.parse(props.query);
  const { search } = props.discodata_query;
  const globalQuery = { ...query, ...search };
  const draggable = props.data?.draggable?.value;
  const queryParameters = props.data?.query_parameters?.value
    ? JSON.parse(props.data.query_parameters.value).properties
    : {};
  queryParameters &&
    Object.keys(queryParameters).forEach(key => {
      console.log(globalQuery[key]);
    });
  // props.setQueryParam({
  //   queryParam: {
  //     'key': 'value',
  //   },
  // });
  useEffect(() => {
    console.log('MOUNT');
    renderMap({ draggable, queryParameters });
    return () => {
      console.log('UNMOUNT');
    };
    /* eslint-disable-next-line */
  }, [])

  useEffect(() => {
    renderMap({ draggable, queryParameters });
    /* eslint-disable-next-line */
  }, [props.data?.query_parameters?.value])
  return (
    <React.Fragment>
      <div className="search-map-menu">
        <Grid.Column>
          <p className="menu-title">Dynamic filter</p>
          <p className="menu-label">Reporting year</p>
          <Dropdown
            fluid
            selection
            value="All reporting years"
            options
            // options={options}
          />
          <p className="menu-label">Industrial sites in this area</p>
          {/*{sites.map((item, index) => (*/}
          {/*  <Grid.Row>*/}
          {/*    <Radio*/}
          {/*      key={index}*/}
          {/*      label={item.label}*/}
          {/*      value={item.value}*/}
          {/*      className="menu-radio"*/}
          {/*      // checked={checkedSite.value === item.value}*/}
          {/*      // onChange={() => setCheckedSite(item)}*/}
          {/*    />*/}
          {/*  </Grid.Row>*/}
          {/*))}*/}
          <p className="menu-title">Quick facts</p>
          {/*{quickFacts.map(fact => (*/}
          {/*  <div className="quick-fact-card">*/}
          {/*    <p className="menu-label">{fact.title}</p>*/}
          {/*    <p className="card-content">*/}
          {/*      {fact.reportingSites} reporting sites*/}
          {/*    </p>*/}
          {/*    <p className="card-content">*/}
          {/*      Most common industry: {fact.commonIndustry} industry*/}
          {/*    </p>*/}
          {/*    <p className="card-content">*/}
          {/*      Most common pollutant: {fact.commonPollutant}*/}
          {/*    </p>*/}
          {/*  </div>*/}
          {/*))}*/}
        </Grid.Column>
      </div>
      <div id="map" className="map" />
      <div id="popup" className="popup">
        {/* eslint-disable-next-line */}
        <a href="#" id="popup-closer" className="ol-popup-closer" />
        <div id="popup-content" />
      </div>
    </React.Fragment>
  );
};

export default compose(
  connect(
    (state, props) => ({
      query: state.router.location.search,
      content:
        state.prefetch?.[state.router.location.pathname] || state.content.data,
      discodata_query: state.discodata_query,
    }),
    {
      setQueryParam,
    },
  ),
)(OpenlayersMapView);
