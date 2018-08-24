import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { arrayOf, func, node, number } from 'prop-types';
import differenceBy from 'lodash/differenceBy';
import classNames from 'classnames';
import { types as sdkTypes } from '../../util/sdkLoader';
import { propTypes } from '../../util/types';
import { ensureListing } from '../../util/data';
import { SearchMapInfoCard, SearchMapPriceLabel, SearchMapGroupLabel } from '../../components';

import { groupedByCoordinates, reducedToArray } from './SearchMap.helpers.js';
import css from './SearchMapWithMapbox.css';

export const LABEL_HANDLE = 'SearchMapLabel';
export const INFO_CARD_HANDLE = 'SearchMapInfoCard';

const { LatLng: SDKLatLng, LatLngBounds: SDKLatLngBounds } = sdkTypes;

/**
 * Fit part of map (descriped with bounds) to visible map-viewport
 *
 * @param {Object} map - map that needs to be centered with given bounds
 * @param {SDK.LatLngBounds} bounds - the area that needs to be visible when map loads.
 */
export const fitMapToBounds = (map, bounds, padding) => {
  // map bounds as string literal for google.maps
  const mapBounds = sdkBoundsToMapboxBounds(bounds);

  // If bounds are given, use it (defaults to center & zoom).
  if (map && mapBounds) {
    if (padding == null) {
      map.fitBounds(mapBounds);
    } else {
      map.fitBounds(mapBounds, { padding, linear: true });
    }
  }
};

/**
 * Convert Mapbox formatted LatLng object to Sharetribe SDK's LatLng coordinate format
 * Longitudes > 180 and < -180 are converted to the correct corresponding value
 * between -180 and 180.
 *
 * @param {LngLat} mapboxLngLat - Mapbox LngLat
 *
 * @return {SDKLatLng} - Converted latLng coordinate
 */
export const mapboxLngLatToSDKLatLng = lngLat => {
  const mapboxLng = lngLat.lng;

  // For bounding boxes that overlap the antimeridian Mapbox sometimes gives
  // longitude values outside -180 and 180 degrees.Those values are converted
  // so that longitude is always between -180 and 180.
  const lng = mapboxLng > 180 ? mapboxLng - 360 : mapboxLng < -180 ? mapboxLng + 360 : mapboxLng;

  return new SDKLatLng(lngLat.lat, lng);
};

/**
 * Convert Mapbox formatted bounds object to Sharetribe SDK's bounds format
 *
 * @param {LngLatBounds} mapboxBounds - Mapbox LngLatBounds
 *
 * @return {SDKLatLngBounds} - Converted bounds
 */
export const mapboxBoundsToSDKBounds = mapboxBounds => {
  if (!mapboxBounds) {
    return null;
  }

  const ne = mapboxBounds.getNorthEast();
  const sw = mapboxBounds.getSouthWest();
  return new SDKLatLngBounds(mapboxLngLatToSDKLatLng(ne), mapboxLngLatToSDKLatLng(sw));
};

/**
 * Convert sdk bounds that overlap the antimeridian into values that can
 * be passed to Mapbox. This is achieved by converting the SW longitude into
 * a value less than -180 that flows over the antimeridian.
 *
 * @param {SDKLatLng} bounds - bounds passed to the map
 *
 * @return {LngLatBoundsLike} a bounding box that is compatible with Mapbox
 */
const sdkBoundsToMapboxBounds = bounds => {
  if (!bounds) {
    return null;
  }
  const { ne, sw } = bounds;

  // if sw lng is > ne lng => the bounds overlap antimeridian
  // => flip the nw lng to the negative side so that the value
  // is less than -180
  const swLng = sw.lng > ne.lng ? -360 + sw.lng : sw.lng;

  return [[swLng, sw.lat], [ne.lng, ne.lat]];
};

/**
 * Return map bounds as SDKBounds
 *
 * @param {Mapbox} map - Mapbox map from where the bounds are asked
 *
 * @return {SDKLatLngBounds} - Converted bounds of given map
 */
export const getMapBounds = map => mapboxBoundsToSDKBounds(map.getBounds());

/**
 * Return map center as SDKLatLng
 *
 * @param {Mapbox} map - Mapbox map from where the center is asked
 *
 * @return {SDKLatLng} - Converted center of given map
 */
export const getMapCenter = map => mapboxLngLatToSDKLatLng(map.getCenter());

/**
 * Check if map library is loaded
 */
export const isMapsLibLoaded = () =>
  typeof window !== 'undefined' && window.mapboxgl && window.mapboxgl.accessToken;

/**
 * Return price labels grouped by listing locations.
 * This is a helper function for SearchMapWithMapbox component.
 */
const priceLabelsInLocations = (
  listings,
  activeListingId,
  infoCardOpen,
  onListingClicked,
  mapComponentRefreshToken
) => {
  const listingArraysInLocations = reducedToArray(groupedByCoordinates(listings));
  const priceLabels = listingArraysInLocations.reverse().map(listingArr => {
    const isActive = activeListingId
      ? !!listingArr.find(l => activeListingId.uuid === l.id.uuid)
      : false;

    // If location contains only one listing, print price label
    if (listingArr.length === 1) {
      const listing = listingArr[0];
      const infoCardOpenIds = Array.isArray(infoCardOpen)
        ? infoCardOpen.map(l => l.id.uuid)
        : infoCardOpen
          ? [infoCardOpen.id.uuid]
          : [];

      // if the listing is open, don't print price label
      if (infoCardOpen != null && infoCardOpenIds.includes(listing.id.uuid)) {
        return null;
      }

      // Explicit type change to object literal for Google OverlayViews (geolocation is SDK type)
      const { geolocation } = listing.attributes;

      const key = listing.id.uuid;
      return {
        markerId: `price_${key}`,
        location: geolocation,
        type: 'price',
        componentProps: {
          key,
          isActive,
          className: LABEL_HANDLE,
          listing,
          onListingClicked,
          mapComponentRefreshToken,
        },
      };
    }

    // Explicit type change to object literal for Google OverlayViews (geolocation is SDK type)
    const firstListing = ensureListing(listingArr[0]);
    const geolocation = firstListing.attributes.geolocation;

    const key = listingArr[0].id.uuid;
    return {
      markerId: `group_${key}`,
      location: geolocation,
      type: 'group',
      componentProps: {
        key,
        isActive,
        className: LABEL_HANDLE,
        listings: listingArr,
        onListingClicked,
        mapComponentRefreshToken,
      },
    };
  });
  return priceLabels;
};

/**
 * Return info card. This is a helper function for SearchMapWithMapbox component.
 */
const infoCardComponent = (
  infoCardOpen,
  onListingInfoCardClicked,
  createURLToListing,
  mapComponentRefreshToken
) => {
  const listingsArray = Array.isArray(infoCardOpen) ? infoCardOpen : [infoCardOpen];

  if (!infoCardOpen) {
    return null;
  }

  const firstListing = ensureListing(listingsArray[0]);
  const key = firstListing.id.uuid;
  const geolocation = firstListing.attributes.geolocation;

  return {
    markerId: `infoCard_${key}`,
    location: geolocation,
    componentProps: {
      key,
      mapComponentRefreshToken,
      className: INFO_CARD_HANDLE,
      listings: listingsArray,
      onListingInfoCardClicked,
      createURLToListing,
    },
  };
};

/**
 * SearchMap component using Mapbox as map provider
 */
class SearchMapWithMapbox extends Component {
  constructor(props) {
    super(props);
    this.map = null;
    this.currentMarkers = [];

    this.onMount = this.onMount.bind(this);
    this.initializeMap = this.initializeMap.bind(this);
  }

  componentDidUpdate(prevProps) {
    if (!this.map) {
      this.initializeMap();
    }

    /* Notify parent component that Mapbox map is loaded */
    this.props.onMapLoad(this.map);
  }

  onMount(element) {
    this.mapContainer = element;
  }

  initializeMap() {
    this.map = new window.mapboxgl.Map({
      container: this.mapContainer,
      style: 'mapbox://styles/mapbox/streets-v10',
      scrollZoom: false,
    });

    var nav = new window.mapboxgl.NavigationControl({ showCompass: false });
    this.map.addControl(nav, 'top-left');

    this.map.on('moveend', this.props.onIdle);
  }

  render() {
    const {
      className,
      listings,
      activeListingId,
      infoCardOpen,
      onListingClicked,
      onListingInfoCardClicked,
      createURLToListing,
      mapComponentRefreshToken,
    } = this.props;

    if (this.map) {
      // Create markers out of price labels and grouped labels
      const labels = priceLabelsInLocations(
        listings,
        activeListingId,
        infoCardOpen,
        onListingClicked,
        mapComponentRefreshToken
      );

      // If map has moved or info card opened, unnecessary markers need to be removed
      const removableMarkers = differenceBy(this.currentMarkers, labels, 'markerId');
      removableMarkers.forEach(rm => rm.marker.remove());

      // Helper function to create markers to given container
      const createMarker = (data, markerContainer) =>
        new window.mapboxgl.Marker(markerContainer, { anchor: 'bottom' })
          .setLngLat([data.location.lng, data.location.lat])
          .addTo(this.map);

      // SearchMapPriceLabel and SearchMapGroupLabel:
      // create a new marker or use existing one if markerId is among previously rendered markers
      this.currentMarkers = labels.filter(v => v != null).map(m => {
        const existingMarkerId = this.currentMarkers.findIndex(
          marker => m.markerId === marker.markerId && marker.marker
        );

        if (existingMarkerId >= 0) {
          const { marker, markerContainer, ...rest } = this.currentMarkers[existingMarkerId];
          return { ...rest, ...m, markerContainer, marker };
        } else {
          const markerContainer = document.createElement('div');
          markerContainer.setAttribute('id', m.markerId);
          markerContainer.classList.add(css.labelContainer);
          const marker = createMarker(m, markerContainer);
          return { ...m, markerContainer, marker };
        }
      });

      /* Create marker for SearchMapInfoCard component */
      if (infoCardOpen) {
        const infoCard = infoCardComponent(
          infoCardOpen,
          onListingInfoCardClicked,
          createURLToListing,
          mapComponentRefreshToken
        );

        // marker container and its styles
        const infoCardContainer = document.createElement('div');
        infoCardContainer.setAttribute('id', infoCard.markerId);
        infoCardContainer.classList.add(css.infoCardContainer);

        this.currentInfoCard = {
          ...infoCard,
          markerContainer: infoCardContainer,
          marker: infoCard ? createMarker(infoCard, infoCardContainer) : null,
        };
      } else {
        this.currentInfoCard = null;
      }
    }

    return (
      <div
        id="map"
        ref={this.onMount}
        className={classNames(className, css.fullArea)}
        onClick={this.props.onClick}
      >
        {this.currentMarkers.map(m => {
          // Remove existing activeLabel classes and add it only to the correct container
          m.markerContainer.classList.remove(css.activeLabel);
          if (activeListingId && activeListingId.uuid === m.componentProps.key) {
            m.markerContainer.classList.add(css.activeLabel);
          }

          const isMapReadyForMarkers = this.map && m.markerContainer;
          // DOM node that should be used as portal's root
          const portalDOMContainer = isMapReadyForMarkers
            ? document.getElementById(m.markerContainer.id)
            : null;

          // Create component portals for correct marker containers
          if (isMapReadyForMarkers && m.type === 'price') {
            return ReactDOM.createPortal(
              <SearchMapPriceLabel {...m.componentProps} />,
              portalDOMContainer
            );
          } else if (isMapReadyForMarkers && m.type === 'group') {
            return ReactDOM.createPortal(
              <SearchMapGroupLabel {...m.componentProps} />,
              portalDOMContainer
            );
          }
          return null;
        })}
        {this.mapContainer && this.currentInfoCard
          ? ReactDOM.createPortal(
              <SearchMapInfoCard {...this.currentInfoCard.componentProps} />,
              this.currentInfoCard.markerContainer
            )
          : null}
      </div>
    );
  }
}

SearchMapWithMapbox.defaultProps = {
  center: null,
  priceLabels: [],
  infoCard: null,
  zoom: 11,
};

SearchMapWithMapbox.propTypes = {
  center: propTypes.latlng,
  priceLabels: arrayOf(node),
  infoCard: node,
  onClick: func.isRequired,
  onIdle: func.isRequired,
  onMapLoad: func.isRequired,
  zoom: number,
};

export default SearchMapWithMapbox;
