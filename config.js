module.exports = {
	displayName: 'Radiosonde',
	hook: 'contextmenu',
   	className:  'plugin-lhpane',
    classNameMobile:     'plugin-mobile-bottom-slide'
    ,
    dependencies: [

        "https://d3js.org/d3.v5.min.js",
        "https://unpkg.com/skewt-plus/dist/bundle.js",

    ],
    exclusive: 'lhpane',
}
