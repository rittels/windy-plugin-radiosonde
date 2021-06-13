
    import pluginDataLoader from '@@windy/plugins/plugin-data-loader';

    const load = pluginDataLoader({
        key: 'tqBdvHJjtNrGq4TrFzt9D5NDz9fIZSC8'
        , plugin: 'windy-plugin-radiosonde'
    });

    export default function(model, lat, lon){
        return load('airData',{model, lat, lon})
    }
