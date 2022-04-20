import React, {
  useRef,
  useEffect,
  useCallback,
  useMemo,
  useState,
} from "react";
import { buildPulsingDot } from "./DotClone";
import { gql, useMutation, useSubscription } from "@apollo/client";
import { Button, Box, ListItem, Text, UnorderedList } from "@chakra-ui/react";
import mapboxgl, { Map as MapBox } from "mapbox-gl";

/**
 * Subscription
 */
const SUBSCRIBE_ANTENNAS = gql`
  subscription AntennasUpdates {
    antennasUpdates {
      antenna_id
      geojson
      performance
      diff
      timestamp
    }
  }
`;

/**
 * Mutation
 */
const MUTATE_ANTENNAS = gql`
  mutation Mutation($antenna_id: String!) {
    crashAntenna(antenna_id: $antenna_id) {
      antenna_id
    }
  }
`;

interface GeoJSON {
  type: string;
  geometry: {
    type: string;
    coordinates: [number, number];
  };
  properties: {
    name: string;
    helps?: string;
  };
}

interface Antenna extends BaseAntenna {
  geojson: GeoJSON;
}

interface RawAntenna extends BaseAntenna {
  geojson: string;
}

interface BaseAntenna {
  antenna_id: string;
  performance: number;
  diff: number;
  timestamp: number;
}

interface AntennasUpdatesSubscription {
  antennasUpdates: Array<RawAntenna>;
}

/**
 * Set up a source data
 * @param map MapBox
 * @param sourceName Map source name
 * @param data Data to set
 */
function setSourceData(
  map: MapBox,
  sourceName: string,
  data: Array<GeoJSON>
): void {
  const source = map.getSource(sourceName);

  if (source) {
    (source as any).setData({
      type: "FeatureCollection",
      features: data,
    });
  }
}

/**
 *
 * @param map MapBox
 * @param name Image layer name
 * @param source Source name
 * @param color Color to be used
 */
function addPulsingDot(
  map: any,
  name: string,
  source: string,
  color: string,
  size?: number
) {
  (map.current as any).addImage(
    name,
    buildPulsingDot(map.current as any, color, size || 30),
    {
      pixelRatio: 2,
    }
  );

  (map.current as any).addLayer({
    id: name,
    type: "symbol",
    source: source,
    layout: {
      "icon-image": name,
    },
  });
}

/**
 * Replace with your own MapBox token
 */
function REPLACE_ME_WITH_YOUR_TOKEN() {
  return (
    "pk" +
    ".ey" +
    "J1Ijo" +
    "iam9hcXVpbmNvbGFjY2kiLCJhIjoiY2t6N2Z4M2pzMWExcTJvdHYxc3k4MzFveSJ9.QSm7ZtegpUwuZ1MCbt4dIg"
  );
}

/**
 * Tail updates require another step here to detect added and removed antennas
 * @param antennasMap
 * @param update
 */
function handleTailEventUpdate(
  event: Antenna,
  antennasMap: Map<string, Antenna>,
  markSet: Set<string>,
  runSet: Set<string>
) {
  const {
    antenna_id: antennaId,
    diff,
    timestamp: updateTimestamp,
    performance: antennaPerformance,
  } = event;
  markSet.delete(antennaId);
  const lastEvent = antennasMap.get(antennaId);

  if (lastEvent) {
    const { timestamp: lastTimestamp, performance: lastPerformance } =
      lastEvent;

    if (diff > 0 && lastTimestamp < updateTimestamp) {
      antennasMap.set(antennaId, event);
    } else if (
      (lastPerformance === antennaPerformance &&
        lastTimestamp <= updateTimestamp) ||
      lastTimestamp < updateTimestamp
    ) {
      runSet.add(antennaId);
    }
  } else if (diff > 0) {
    antennasMap.set(antennaId, event);
  }
}

function createLayer(
  id: string,
  source: string,
  color: string
): mapboxgl.AnyLayer {
  return {
    id,
    type: "circle",
    source,
    paint: {
      "circle-radius": 70,
      "circle-color": color,
      "circle-opacity": 0.3,
    },
    filter: ["==", "$type", "Point"],
  };
}

/**
 * React component that renders antennas performance in a list and a map.
 * @returns
 */
export default function AntennasMap() {
  /**
   * References
   */
  const mapContainer = useRef<any>(null);
  const map = useRef<MapBox>(null);
  const dataRef = useRef<AntennasUpdatesSubscription | undefined>(undefined);
  const [antennasMap, setAntennasMap] = useState<Map<string, Antenna>>(
    new Map()
  );
  const [antennasSupportedSet, setAntennasSupportedSet] = useState<Set<string>>(
    new Set()
  );
  const markSetRef = useRef<Set<string>>(new Set());

  /**
   * GraphQL Subscription
   */
  const { error, data } = useSubscription<AntennasUpdatesSubscription>(
    SUBSCRIBE_ANTENNAS,
    { fetchPolicy: "network-only" }
  );

  /**
   * GraphQL Mutations
   */
  const [mutateFunction, { error: mutationError }] =
    useMutation<AntennasUpdatesSubscription>(MUTATE_ANTENNAS);

  /**
   * Layers Memo
   */
  const typesOfAntennas = useMemo(
    () => [
      { name: "healthy", layerColor: "#00FF00", dotColor: "0, 255, 0" },
      { name: "unhealthy", layerColor: "#FF0000", dotColor: "255, 0, 0" },
      { name: "semihealthy", layerColor: "#FFFF00", dotColor: "255, 255, 0" },
      { name: "helper", layerColor: "#00FF00", dotColor: "0, 255, 0" },
    ],
    []
  );

  const mainLayers = useMemo(
    () => [
      "healthy-antennas-layer",
      "unhealthy-antennas-layer",
      "semihealthy-antennas-layer",
      "healthy-antennas-pulsing-dot",
      "unhealthy-antennas-pulsing-dot",
      "semihealthy-antennas-pulsing-dot",
    ],
    []
  );

  /**
   * GraphQL Errors logging
   */
  if (error) {
    console.error(error);
  }

  if (mutationError) {
    console.error(mutationError);
  }

  /**
   * Callbacks & Handlers
   */
  const onHighVoltageCrashClick = useCallback(
    (event) => {
      mutateFunction({
        variables: {
          antenna_id: event.target.id,
        },
      });
    },
    [mutateFunction]
  );

  /**
   * Handle map antennas helpers filter
   */
  const onHelpersClick = useCallback(() => {
    const { current: mapBox } = map;
    if (mapBox) {
      mapBox.setLayoutProperty(
        "helper-antennas-pulsing-dot",
        "visibility",
        "visible"
      );

      mainLayers.forEach((layer) =>
        mapBox.setLayoutProperty(layer, "visibility", "none")
      );
    }
  }, [mainLayers]);

  /**
   * Handle map main antennas filter
   */
  const onMainClick = useCallback(() => {
    const { current: mapBox } = map;
    if (mapBox) {
      mainLayers.forEach((layer) =>
        mapBox.setLayoutProperty(layer, "visibility", "visible")
      );
    }
  }, [mainLayers]);

  /**
   * Config Map
   */
  const onLoad = useCallback(() => {
    /**
     * Set up antenna geojson's
     */
    const { current: mapBox } = map;
    if (mapBox) {
      /**
       * Map sources
       */
      typesOfAntennas.forEach(({ name, dotColor, layerColor }) => {
        /**
         * Add antenna source
         */
        mapBox.addSource(`${name}-antennas`, {
          type: "geojson",
          data: {
            type: "FeatureCollection",
            features: [],
          },
        });

        /**
         * Add antenna layer
         */
        if (name !== "helper") {
          mapBox.addLayer(
            createLayer(
              `${name}-antennas-layer`,
              `${name}-antennas`,
              layerColor
            )
          );
        }

        /**
         * Add antenna pulsating dot
         */
        addPulsingDot(
          map,
          `${name}-antennas-pulsing-dot`,
          `${name}-antennas`,
          dotColor,
          50
        );
      });
    }
  }, [typesOfAntennas]);

  /**
   * Use effects
   */

  /**
   * Process data
   */
  useEffect(() => {
    const { current: mapBox } = map;
    const { current: markSet } = markSetRef;

    /**
     * Only update when there is new data
     */
    if (data && data !== dataRef.current) {
      dataRef.current = data;

      const { antennasUpdates: antennasUpdatesData } = data;

      if (antennasUpdatesData && antennasUpdatesData.length > 0) {
        /**
         * Set Up Antennas arrays
         */
        const healthy: Array<GeoJSON> = [];
        const semiHealthy: Array<GeoJSON> = [];
        const unhealthy: Array<GeoJSON> = [];
        const helpers: Array<GeoJSON> = [];
        const runSet = new Set<string>();
        antennasSupportedSet.clear();

        /**
         * Parse and update antennas performance
         */
        antennasUpdatesData.forEach((antennaUpdate) => {
          try {
            const { geojson: rawGeoJson } = antennaUpdate;
            const geojson = JSON.parse(rawGeoJson);
            const antenna = { ...antennaUpdate, geojson };
            geojson.type = "Feature";

            handleTailEventUpdate(antenna, antennasMap, markSet, runSet);
          } catch (errParsing) {
            console.error(errParsing);
          }
        });

        /**
         * Remove unused antennas
         */
        markSet.forEach((markedEventId) => {
          console.log("Removing ", markedEventId);
          antennasMap.delete(markedEventId);
        });
        markSetRef.current = runSet;

        /**
         * Flap helper antennas into one array
         */
        Array.from(antennasMap.values()).forEach((antenna) => {
          const { antenna_id: antennaId, geojson, performance } = antenna;
          const { properties } = geojson;
          const { helps } = properties;

          if (!helps) {
            antennasMap.set(antennaId, antenna);
            if (performance > 5) {
              healthy.push(geojson);
            } else if (performance < 4.75) {
              unhealthy.push(geojson);
            } else {
              semiHealthy.push(geojson);
            }
          } else {
            helpers.push(geojson);
            antennasSupportedSet.add(helps);
          }
        });

        if (mapBox) {
          setSourceData(mapBox, "healthy-antennas", healthy);
          setSourceData(mapBox, "unhealthy-antennas", unhealthy);
          setSourceData(mapBox, "semihealthy-antennas", semiHealthy);
          setSourceData(mapBox, "helper-antennas", helpers);
        }

        setAntennasMap(new Map(antennasMap));
        setAntennasSupportedSet(new Set(antennasSupportedSet));
      }
    }
  }, [antennasMap, antennasSupportedSet, data]);

  /**
   * Create the map
   */
  useEffect(() => {
    const { current: mapBox } = map;
    if (mapBox) return;

    mapboxgl.accessToken = REPLACE_ME_WITH_YOUR_TOKEN();
    (map.current as any) = new mapboxgl.Map({
      container: "map",
      style: "mapbox://styles/mapbox/dark-v10",
      center: [-73.988, 40.733],
      zoom: 12.5,
      scrollZoom: false,
      doubleClickZoom: false,
      dragRotate: true,
      antialias: true,
      bearing: -60,
    });

    (map.current as any).on("load", onLoad);
  });

  return (
    <Box height={"100%"}>
      <Box
        display={"flex"}
        width={"100%"}
        height={"65%"}
        paddingX={"5rem"}
        overflow={"hidden"}
      >
        <UnorderedList
          minWidth={"400px"}
          maxWidth={"400px"}
          marginRight={"4rem"}
          textAlign={"left"}
          overflow={"scroll"}
        >
          {Array.from(antennasMap.values())
            .filter((x) => x.geojson.properties.helps === undefined)
            .map((x) => {
              return (
                <ListItem key={x.antenna_id} marginBottom={"10px"}>
                  <Box display={"flex"}>
                    <Text
                      fontSize={"2xl"}
                      textOverflow={"ellipsis"}
                      overflow={"hidden"}
                      whiteSpace={"nowrap"}
                      color={"gray.300"}
                      width={"200px"}
                    >
                      <span style={{ fontWeight: 300 }}>Performance:</span>{" "}
                      <b>{x.performance.toString().substring(0, 4)}</b>
                    </Text>
                    {antennasSupportedSet.has(x.geojson.properties.name) && (
                      <span>🛠️</span>
                    )}
                  </Box>
                  <Box display={"flex"} fontSize={"md"}>
                    <Text
                      textOverflow={"ellipsis"}
                      overflow={"hidden"}
                      whiteSpace={"nowrap"}
                      color={"gray.500"}
                      fontWeight={400}
                    >
                      📡 {x.geojson.properties.name}
                    </Text>
                    <Button
                      id={x.antenna_id}
                      onClick={onHighVoltageCrashClick}
                      size="xs"
                      marginLeft="0.5rem"
                    >
                      ⚡
                    </Button>
                  </Box>
                </ListItem>
              );
            })}
        </UnorderedList>
        <Box
          id="map"
          width={"100%"}
          boxShadow={"xl"}
          ref={mapContainer}
          className="map"
        />
      </Box>
      <Box marginTop={10} marginLeft={"5rem"} textAlign="left">
        <Button marginRight={10} onClick={onMainClick}>
          Main
        </Button>
        <Button onClick={onHelpersClick}>Helpers</Button>

        <Text fontSize={"md"} marginTop="1rem">
          {" "}
          Total antennas deployed: {antennasMap.size}
        </Text>
      </Box>
    </Box>
  );
}
