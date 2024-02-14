import { PubSubService } from '../_shared/pubSubServiceInterface';

const EVENTS = {
  COLORBAR_STATE_CHANGED: 'event::ColorbarService:stateChanged',
};

export default class ColorbarService extends PubSubService {
  colorbars = {};
  public static REGISTRATION = {
    name: 'colorbarService',
    create: () => {
      return new ColorbarService();
    },
  };

  constructor() {
    super(EVENTS);
  }

  addColorbar(viewportId, element, options = {}, ViewportColorbar) {
    const colorbarContainer = document.createElement('div');
    colorbarContainer.id = `ctColorbarContainer-${viewportId}`;

    const defaultStyles = {
      position: 'absolute',
      boxSizing: 'border-box',
      border: 'solid 1px #555',
      cursor: 'initial',
      width: options.width || '2.5%',
      height: '50%',
      right: '5%',
      top: '50%',
      transform: 'translateY(-50%)',
    };

    const positionStyles = {
      left: {
        left: '5%',
        right: 'unset',
      },
      right: {
        right: '5%',
        left: 'unset',
      },
      top: {
        top: '5%',
        bottom: 'unset',
        height: options.width || '2.5%',
        width: '50%',
        transform: 'translateX(-50%)',
      },
      bottom: {
        bottom: '5%',
        top: 'unset',
        height: options.width || '2.5%',
        width: '50%',
        transform: 'translateX(-50%)',
      },
    };

    Object.assign(colorbarContainer.style, defaultStyles);

    if (options.position in positionStyles) {
      Object.assign(colorbarContainer.style, positionStyles[options.position]);
    }

    element.appendChild(colorbarContainer);

    const colorbar = new ViewportColorbar({
      id: `ctColorbar-${viewportId}`,
      element,
      colormaps: options.colormaps || {},
      activeColormapName: options.activeColormapName || 'Grayscale',
      container: colorbarContainer,
      ticks: {
        position: 'left',
        style: {
          font: '12px Arial',
          color: '#fff',
          maxNumTicks: 8,
          tickSize: 5,
          tickWidth: 1,
          labelMargin: 3,
        },
        ...options.ticks,
      },
    });

    this.colorbars[viewportId] = { colorbar, container: colorbarContainer, needsRefresh: false };

    this._broadcastEvent(EVENTS.COLORBAR_STATE_CHANGED, {
      viewportId,
      state: 'added',
    });
  }

  removeColorbar(viewportId) {
    const colorbarInfo = this.colorbars[viewportId];
    if (colorbarInfo) {
      colorbarInfo.container.parentNode.removeChild(colorbarInfo.container);
      delete this.colorbars[viewportId];

      // Notify subscribers about the colorbar removal
      this._broadcastEvent(EVENTS.COLORBAR_STATE_CHANGED, {
        viewportId,
        state: 'removed',
      });
    }
  }

  updateActiveColormapForColorbar(viewportId, activeColormapName) {
    const colorbarInfo = this.colorbars[viewportId];
    if (colorbarInfo) {
      colorbarInfo.colorbar.activeColormapName = activeColormapName;
    }
    this._broadcastEvent(EVENTS.COLORBAR_STATE_CHANGED, {
      viewportId,
      state: 'updated',
    });
  }

  isColorbarToggled(viewportId) {
    return this.colorbars[viewportId] ? true : false;
  }

  getState() {
    return this.colorbars;
  }

  getColorbarState(viewportId) {
    return this.colorbars[viewportId];
  }

  markForRefresh(viewportId, refresh) {
    const colorbarInfo = this.colorbars[viewportId];
    if (colorbarInfo) {
      colorbarInfo.needsRefresh = refresh;
    }
  }
}
