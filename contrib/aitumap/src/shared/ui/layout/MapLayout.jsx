import React, { useContext } from "react";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { useColorModeValue } from "@chakra-ui/react";
import { MapContext, useWindowDimensions } from "../../../shared";
import Wallpaper from "../general/map/Wallpaper";
import IconsCommon from "../general/map/IconsCommon";

const MapLayout = ({ children }) => {
  const { height, width } = useWindowDimensions();
  const backgroundColorPrimary = "#363636ff";
  const backgroundColorSecondary = "#4e4e4eff";
  const backgroundColor = useColorModeValue(
    backgroundColorSecondary,
    backgroundColorPrimary
  );
  const strokeColorLight = "#7f7f7f";
  const strokeColorDark = "#7f7f7f";
  const strokeColor = useColorModeValue(strokeColorLight, strokeColorDark);
  const { funMode } = useContext(MapContext);

  const dropShadow = funMode
    ? "drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.5))"
    : "";

  return (
    <TransformWrapper defaultScale={1}>
      <TransformComponent>
        <svg
          width={width}
          height={height}
          xmlns={"http://www.w3.org/2000/svg"}
          viewBox={"0 0 924.69 396.16"}
        >
          <defs>
            <style>
              {`  
                  .bg {
                    stroke: ${strokeColor};
                    fill: ${backgroundColor};
                  }
                  .map-groups-stairs {
                    fill: ${useColorModeValue("#ffffff", "#1a202c")};
                    pointer-events: none;
                  }
                  .map-groups-stairs polygon, 
                  .map-groups-stairs polyline {
                    stroke: ${strokeColor};
                  }
                  .map-groups-stairs g  path:nth-child(1) {
                    fill: #007aff;
                  }
                  .map-groups-stairs g  path:nth-child(2) {
                    fill: #fff;
                  }
                  .map-groups-stairs-fill {
                    fill: ${backgroundColor};
                    pointer-events: none;
                  }
                  .map-groups-stairs-fill polygon, 
                  .map-groups-stairs-fill polyline {
                    stroke: ${strokeColor};
                  }
                  .map-groups-stairs-fill g  path:nth-child(1) {
                    fill: #007aff;
                  }
                  .map-groups-stairs-fill g  path:nth-child(2) {
                    fill: #fff;
                  }
                  .map-groups-gym path,
                  .map-groups-gym line,
                  .map-groups-gym polygon,
                  .map-groups-gym polyline {
                    stroke:${strokeColor} !important;
                    fill:#4da2ff;  
                    
                  }
                  .map-groups-gym-pole path,
                  .map-groups-gym-pole line,
                  .map-groups-gym-pole polygon {
                    stroke:${strokeColor};
                    stroke-miterlimit:10;
                    stroke-width: 0.75;
                    fill:none !important;
                    filter: ${dropShadow};
                  }
                  .map-groups-rooms g line,
                  .map-groups-rooms g polygon,
                  .map-groups-rooms g polyline {
                    stroke:${strokeColor};
                    fill:#4da2ff;
                    filter: ${dropShadow};
                  }
                  .map-groups-rooms g text,
                  .map-groups-rooms g span,
                  .map-groups-rooms g path {
                    stroke:#ffffff !important;
                    stroke-width: 0.1 !important;
                    fill: #ffffff !important;
                    color: #ffffff !important;
                    font: 11px sans-serif;
                    text-rendering: optimizeSpeed !important;
                    pointer-events: none;
                    
                  }
                  .map-groups-rooms g line:hover,
                  .map-groups-rooms g polygon:hover,
                  .map-groups-rooms g polyline:hover {
                    // fill:#62cf6b !important;
                    opacity: 0.75;
                    filter: ${dropShadow};
                  }
                  .map-groups-techs polygon,
                  .map-groups-techs polyline {
                    stroke:${strokeColor};
                    fill:#bfbfbf;
                    pointer-events: none;
                    filter: ${dropShadow};
                  }
                  .map-groups-techs-icon path:nth-child(1) {
                    fill: #007aff;
                  }
                  .map-groups-techs-icon path:nth-child(2) {
                    fill: #fff;
                  }
                  .map-groups-wcs polyline {
                    stroke:${strokeColor};
                    fill:#ac7ab6;
                    pointer-events: none;
                  }
                  .map-groups-wcs-icon path:nth-child(1) {
                    fill: #007aff;
                  }
                  .map-groups-wcs-icon path:nth-child(2) {
                    fill: #fff;
                  }
                  .map-groups-escapes polygon,
                  .map-groups-escapes polyline {
                    stroke:${strokeColor};
                    fill:#bfbfbf;
                    pointer-events: none;
                  }
                  .map-groups-escapes-icon path:nth-child(1) {
                    fill: #009245;
                  }
                  .map-groups-escapes-icon path:nth-child(2) {
                    fill: #fff;
                  }
                  .room-map-group-search-target,
                  .room-map-group-search-target line,
                  .room-map-group-search-target polygon,
                  .room-map-group-search-target polyline {
                    fill:#62cf6b !important;
                  }
                  .map-groups-walls path,
                  .map-groups-walls polyline,
                  .map-groups-walls polygon,
                  .map-groups-walls rect,
                  .map-groups-walls line {
                    stroke:${strokeColor};
                    fill: ${backgroundColor};
                  }
                  .map-groups-void path,
                  .map-groups-void polyline,
                  .map-groups-void polygon,
                  .map-groups-void rect,
                  .map-groups-void line {
                    stroke:${strokeColor};
                    fill: ${useColorModeValue("#ffffff", "#1a202c")};
                  }
                  .map-groups-coworking-atameken path,
                  .map-groups-coworking-atameken polygon, 
                  .map-groups-coworking-atameken polyline {
                    stroke:${strokeColor};
                    fill:${backgroundColor};
                    filter: ${dropShadow};
                  }
                  .label-huge {
                    fill:${strokeColor} !important;
                    color:${strokeColor}!important;
                    stroke-width: 0.1 !important
                  }
                  .label {
                    fill:#ffffff !important;
                    color:#ffffff !important;
                    stroke-width: 0.1 !important
                  }
                  .label-white {
                    fill:#ffffff !important;
                    color:#ffffff !important;
                    stroke-width: 0.1 !important
                  }
                  .map-groups-rooms-vk g line,
                  .map-groups-rooms-vk g polygon,
                  .map-groups-rooms-vk g polyline {
                    stroke:${strokeColor};
                    fill:#61a166;
                    filter: ${dropShadow};
                  }
                  .map-groups-rooms-vk g text,
                  .map-groups-rooms-vk g span,
                  .map-groups-rooms-vk g path {
                    stroke:#ffffff !important;
                    stroke-width: 0.1 !important;
                    fill: #ffffff !important;
                    color: #ffffff !important;
                    font: 11px sans-serif !important;
                    text-rendering: optimizeSpeed !important;
                    pointer-events: none;
                  }
                  .fit-text {
                    font: 9px sans-serif !important;
                  }
                `}
            </style>
          </defs>
          <Wallpaper />
          {children}
          <IconsCommon />
        </svg>
      </TransformComponent>
    </TransformWrapper>
  );
};

export default MapLayout;
