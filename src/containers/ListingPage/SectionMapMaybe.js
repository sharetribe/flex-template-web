import React, { Component } from 'react'
import { string, object } from 'prop-types'
import classNames from 'classnames'
import { FormattedMessage } from '../../util/reactIntl'
import { propTypes } from '../../util/types'
import { obfuscatedCoordinates } from '../../util/maps'
import { Map } from '../../components'
import config from '../../config'

import css from './ListingPage.css'

class SectionMapMaybe extends Component {
  constructor(props) {
    super(props)
    this.state = { isStatic: true }
  }

  render() {
    const {
      className, rootClassName, geolocation, publicData, listingId, metadata
    } = this.props

    if (!geolocation) {
      return null
    }

    const address = publicData && publicData.location ? publicData.location.address : ''
    const classes = classNames(rootClassName || css.sectionMap, className)
    const cacheKey = listingId ? `${listingId.uuid}_${geolocation.lat}_${geolocation.lng}` : null

    const mapProps = config.maps.fuzzy.enabled
      ? { obfuscatedCenter: obfuscatedCoordinates(geolocation, cacheKey) }
      : { address, center: geolocation }
    const map = <Map
      {...mapProps}
      useStaticMap={true}
      createSurf={true}
      metadata={metadata}
    />

    return (
      <div className={classes}>
        <h2 className={css.locationTitle}>
          <FormattedMessage id="ListingPage.locationTitle" />
        </h2>
        {this.state.isStatic ? (
          <button
            className={css.map}
            onClick={() => {
              this.setState({ isStatic: false })
            }}
          >
            {map}
          </button>
        ) : (
          <div className={css.map}>{map}</div>
        )}
      </div>
    )
  }
}

SectionMapMaybe.defaultProps = {
  rootClassName: null,
  className: null,
  geolocation: null,
  listingId: null,
}

SectionMapMaybe.propTypes = {
  rootClassName: string,
  className: string,
  geolocation: propTypes.latlng,
  listingId: propTypes.uuid,
  metadata: object
}

export default SectionMapMaybe
