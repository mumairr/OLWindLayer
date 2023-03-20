// react
import React, { useState, useEffect, useRef } from "react";

/* Stylesheets */
import "ol/ol.css";
import "ol-ext/dist/ol-ext.css";

/* Libraries */
import { theme, ConfigProvider } from "antd";
import DarkModeToggle from "react-dark-mode-toggle";

/* OL, OL-Ext */
import Map from "ol/Map.js";
import OSM from "ol/source/OSM.js";
import TileLayer from "ol/layer/Tile.js";
import Link from "ol/interaction/Link.js";
import View from "ol/View.js";
import { get as getProjection } from "ol/proj.js";
import LayerSwitcherImage from "ol-ext/control/LayerSwitcherImage";
import CanvasScaleLine from "ol-ext/control/CanvasScaleLine";
import GeolocationButton from "ol-ext/control/GeolocationButton";
import { XYZ } from "ol/source";
import { FullScreen, defaults as defaultControls } from "ol/control.js";
import LayerGroup from "ol/layer/Group";
import { WindLayer } from "ol-wind";

const { defaultAlgorithm, darkAlgorithm } = theme;

const projection = getProjection("EPSG:4326");

let layers = [],
  switcher;
let initialMap;

let osm = new TileLayer({
  baseLayer: true,
  title: "OpenStreetMap",
  visible: false,
  source: new OSM(),
});

let googleMapsHybrid = new TileLayer({
  baseLayer: false,
  title: "Google Maps Hybrid",
  visible: true,
  source: new XYZ({
    url: "http://mt0.google.com/vt/lyrs=h&hl=en&x={x}&y={y}&z={z}",
  }),
});

let googleMapsSatellite = new TileLayer({
  baseLayer: false,
  title: "Google Maps Hybrid",
  visible: true,
  source: new XYZ({
    url: "http://mt0.google.com/vt/lyrs=s&hl=en&x={x}&y={y}&z={z}",
  }),
});

let googleMaps = new TileLayer({
  baseLayer: true,
  title: "Google Maps",
  visible: false,
  source: new XYZ({
    url: "http://mt0.google.com/vt/lyrs=m&hl=en&x={x}&y={y}&z={z}",
  }),
});

let googleSatellite = new LayerGroup({
  baseLayer: true,
  title: "Google Satellite",
  openInLayerSwitcher: false,
  collapsible: false,
  layers: [googleMapsSatellite, googleMapsHybrid],
});

function MapWrapper() {
  const [map, setMap] = useState();
  const [color, setColor] = useState("#fff");
  const [olColor, setolColor] = useState("#333");
  const [olFontcolor, setolFontcolor] = useState("#fff");
  const [olHighcolor, setolHighcolor] = useState("#fff");
  const [isDarkMode, setIsDarkMode] = useState(false);

  const mapElement = useRef();

  const mapRef = useRef();
  mapRef.current = map;

  const modeChange = () => {
    setIsDarkMode(!isDarkMode);
    isDarkMode ? setColor("#fff") : setColor("#000");
    isDarkMode ? setolColor("#333") : setolColor("#fff");
    isDarkMode ? setolHighcolor("#fff") : setolHighcolor("#333");
    isDarkMode ? setolFontcolor("#fff") : setolFontcolor("#333");
    document.documentElement.style.setProperty(
      "--ol-background-color",
      olColor
    );
    document.documentElement.style.setProperty(
      "--ol-subtle-foreground-color",
      olFontcolor
    );
    document.documentElement.style.setProperty(
      "--ol-accent-background-color",
      olHighcolor
    );
  };

  layers = [
    osm,
    googleMaps,
    googleSatellite
  ];

  useEffect(() => {
    if (!mapRef.current) {
      initialMap = new Map({
        controls: defaultControls().extend([
          new FullScreen({
            className: "ol-full-screen",
            tipLabel: "Toggle full-screen",
          }),
        ]),
        layers: layers,
        target: mapElement.current,
        view: new View({
          projection: projection,
          center: [0, 0],
          zoom: 2,
        }),
      });


      switcher = new LayerSwitcherImage({
      });

      initialMap.addControl(switcher);

      var scaleLineControl = new CanvasScaleLine();
      initialMap.addControl(scaleLineControl);

      var geoloc = new GeolocationButton();
      initialMap.addControl(geoloc);

      initialMap.addInteraction(new Link());
      setMap(initialMap);

      fetch(
        "https://sakitam.oss-cn-beijing.aliyuncs.com/codepen/wind-layer/json/wind.json"
      )
        .then((res) => res.json())
        .then((res) => {
          const windLayer = new WindLayer(res, {
            forceRender: false,
            windOptions: {
              velocityScale: .3 / 20,
              paths: 10000,
              // eslint-disable-next-line no-unused-vars
              colorScale: [
                "rgb(36,104, 180)",
                "rgb(60,157, 194)",
                "rgb(128,205,193 )",
                "rgb(151,218,168 )",
                "rgb(198,231,181)",
                "rgb(238,247,217)",
                "rgb(255,238,159)",
                "rgb(252,217,125)",
                "rgb(255,182,100)",
                "rgb(252,150,75)",
                "rgb(250,112,52)",
                "rgb(245,64,32)",
                "rgb(237,45,28)",
                "rgb(220,24,32)",
                "rgb(180,0,35)",
              ],
              width: 3,
              generateParticleOption: false,
            },
          });

          initialMap.addLayer(windLayer);
        });
    }
  }, []);

  return (
    <ConfigProvider
      theme={{
        algorithm: isDarkMode ? darkAlgorithm : defaultAlgorithm,
      }}
    >
      <div ref={mapElement} id="map" className="map-container">
        <div
          style={{
            position: "fixed",
            zIndex: 500,
            top: "4em",
            bottom: "60%",
          }}
        >
          <DarkModeToggle
            onChange={modeChange}
            checked={isDarkMode}
            size={45}
          />
        </div>
      </div>
    </ConfigProvider>
  );
}

export default MapWrapper;
