import worldSVG from '@plone/volto/icons/world.svg';
import DataConnectedEmbedBlockEdit from './DataConnectedEmbedEdit';
import DataConnectedEmbedBlockView from './View';

export default (config) => {
  config.blocks.blocksConfig.data_connected_embed = {
    id: 'data_connected_embed',
    title: 'Data connected embed',
    icon: worldSVG,
    group: 'data_blocks',
    view: DataConnectedEmbedBlockView,
    edit: DataConnectedEmbedBlockEdit,
    restricted: false,
    mostUsed: false,
    sidebarTab: 1,
    security: {
      addPermission: [],
      view: [],
    },
  };
  return config;
};
