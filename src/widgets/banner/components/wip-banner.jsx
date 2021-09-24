import React from 'react';

import { WIDGET_WIP_BANNER } from 'constants/dom-constants';

const { COMPONENT_CLASS } = WIDGET_WIP_BANNER;

const WipBanner = props => {
  return (
    <div className={COMPONENT_CLASS} hidden={!props.showBanner}>
      {props.bannerMessage}
    </div>
  );
};

export default WipBanner;
