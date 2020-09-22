/**
 * Created by zhaohongyang1 on 18-4-26.
 */
import * as React from 'react';
import classNames from 'classnames';
// import fixMask from "./fixMask";
import './index.less';

export interface MaskProps {
  prefixCls?: string;
  className?: string;
  /**
   * Whather mask should be transparent (no color)
   *
   */
  transparent?: boolean;
  onClick?: (e?: any) => void;
}

/**
 * screen mask, use in `Dialog`, `ActionSheet`, `Popup`.
 *
 */
export default class Mask extends React.PureComponent<MaskProps, any> {
  static defaultProps = {
    prefixCls: 'Llong-mask',
    transparent: false
  };
  scrollTop: number = 0;
  isIphoneXr: boolean | number =
    /iphone/gi.test(window.navigator.userAgent) &&
    window.devicePixelRatio &&
    window.devicePixelRatio === 2 &&
    window.screen.width === 414 &&
    window.screen.height === 896;
  destroy = () => {
    // Use regex to prevent matching `mask-open` as part of a different class, e.g. `my-mask-opened`
    let classes;
    classes = document.body.className.replace(/(^| )mask-open( |$)/, ' ');

    // const classes = document.body.className.replace(/(^| )mask-open( |$)/, " ");
    document.body.className = classNames(classes).trim();
    document.body.style.top = '';
    if (document['scrollingElement']) {
      document.scrollingElement.scrollTop = this.scrollTop;
    }

    document.body.scrollTop = this.scrollTop;
  };

  show = () => {
    const classes = document.body.className;
    // if (!this.isIphoneXr) {
    document.body.className = classNames(classes, 'mask-open');
    // }
  };

  /* 获取窗口滚动条高度 */
  getScrollTop = () => {
    var scrollTop = 0;
    if (document.documentElement && document.documentElement.scrollTop) {
      scrollTop = document.documentElement.scrollTop;
    } else if (document.body) {
      scrollTop = document.body.scrollTop;
    }
    return scrollTop;
  };

  componentDidMount() {
    // fixMask();
    // if (!this.isIphoneXr) {
    this.scrollTop =
      (document['scrollingElement'] &&
        document['scrollingElement'].scrollTop) ||
      document.body.scrollTop;
    document.body.style.top = -this.scrollTop + 'px';
    // }
    let oldScrollTop = this.getScrollTop() || 0;
    //
    if (this.isIphoneXr) {
      document.body.addEventListener('focusin', () => {
        //软键盘弹起事件
        console.log('键盘弹起');
      });

      document.body.addEventListener('focusout', () => {
        //软键盘关闭事件
        console.log('键盘收起');
        //键盘收起页面空白问题
        document.body.scrollTop = oldScrollTop;
        document.documentElement.scrollTop = oldScrollTop;
      });
    }
    this.show();
  }

  componentWillUnmount() {
    this.destroy();
  }
  render() {
    const { transparent, className, prefixCls, ...others } = this.props;
    const clz = classNames(
      {
        [prefixCls || 'Llong-mask']: !transparent,
        [`${prefixCls}_transparent`]: transparent
      },
      className
    );

    return (
      <div
        className={clz}
        {...others}
        onTouchMove={e => e.stopPropagation()}
        onTouchStart={e => e.stopPropagation()}
        onTouchEnd={e => e.stopPropagation()}
      />
    );
  }
}
