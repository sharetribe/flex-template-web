import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import css from './IconSocialMediaSnapchat.css';

import snapchatIcon from './snapchat.svg';

const IconSocialMediaSnapchat = props => {
  const { rootClassName, className } = props;
  const classes = classNames(rootClassName || css.root, className);

  return (
    <svg className={classes} xmlns="http://www.w3.org/2000/svg" width="20" height="19" viewBox="0 0 20 19" fill="none">
      <path d="M9.81131 0C10.6073 0 13.3063 0.223 14.5803 3.073C15.0063 4.032 14.9043 5.662 14.8203 6.971L14.8183 7.018C14.8073 7.164 14.8003 7.296 14.7943 7.428C14.8932 7.48064 15.0044 7.50553 15.1163 7.5C15.3573 7.487 15.6463 7.404 15.9473 7.259C16.0632 7.20164 16.1911 7.17283 16.3203 7.175C16.4663 7.175 16.6093 7.198 16.7293 7.247C17.0903 7.367 17.3193 7.632 17.3193 7.921C17.3323 8.282 17.0063 8.596 16.3443 8.86C16.2733 8.883 16.1753 8.921 16.0683 8.956C15.7053 9.065 15.1513 9.245 14.9953 9.607C14.9233 9.788 14.9463 10.028 15.0933 10.304L15.1053 10.317C15.1533 10.426 16.3333 13.112 18.9593 13.546C19.0556 13.5615 19.143 13.6116 19.205 13.6869C19.267 13.7622 19.2995 13.8575 19.2963 13.955C19.2963 14.015 19.2833 14.074 19.2603 14.136C19.0673 14.593 18.2373 14.931 16.7303 15.157C16.6833 15.23 16.6343 15.459 16.5983 15.616C16.5763 15.76 16.5383 15.905 16.4913 16.06C16.4303 16.278 16.2743 16.385 16.0453 16.385H16.0213C15.8755 16.3783 15.7306 16.3585 15.5883 16.326C15.2518 16.2534 14.9085 16.2172 14.5643 16.218C14.3243 16.218 14.0843 16.23 13.8323 16.278C13.3493 16.362 12.9283 16.651 12.4463 16.988C11.7593 17.469 10.9773 18.024 9.79731 18.024C9.74931 18.024 9.70131 18.012 9.65131 18.012H9.53231C8.35131 18.012 7.58131 17.469 6.89531 16.976C6.41431 16.638 6.00531 16.35 5.52231 16.265C5.27562 16.2282 5.02671 16.2081 4.77731 16.205C4.34231 16.205 4.00631 16.277 3.75431 16.325C3.58431 16.36 3.44031 16.384 3.31931 16.384C3.21386 16.392 3.10895 16.3626 3.023 16.301C2.93706 16.2394 2.87556 16.1494 2.84931 16.047C2.80131 15.893 2.77831 15.734 2.74231 15.591C2.70431 15.445 2.65731 15.195 2.60931 15.133C1.06631 14.954 0.236308 14.616 0.0443081 14.147C0.0177891 14.0902 0.0028326 14.0287 0.000308236 13.966C-0.00353599 13.8683 0.0286873 13.7727 0.090837 13.6973C0.152987 13.6218 0.240717 13.5719 0.337308 13.557C2.96231 13.123 4.14231 10.438 4.19131 10.325L4.20431 10.302C4.34931 10.025 4.38431 9.782 4.30031 9.603C4.14431 9.254 3.58931 9.074 3.23031 8.953C3.13478 8.92887 3.04146 8.89676 2.95131 8.857C2.06131 8.507 1.94031 8.109 1.98931 7.833C2.06131 7.449 2.53031 7.196 2.92831 7.196C3.04531 7.196 3.14531 7.219 3.23631 7.256C3.57331 7.411 3.87131 7.497 4.12431 7.497C4.25393 7.50176 4.38254 7.47245 4.49731 7.412L4.45631 6.954C4.37631 5.647 4.27431 4.019 4.70331 3.065C5.93931 0.229 8.63231 0.0109999 9.42731 0.0109999L9.76231 0H9.81131Z"/>
    </svg>
    )
};

IconSocialMediaSnapchat.defaultProps = { rootClassName: null, className: null };

const { string } = PropTypes;

IconSocialMediaSnapchat.propTypes = { rootClassName: string, className: string };

export default IconSocialMediaSnapchat;
