import React from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { withRouter } from 'react-router';
import { Menu, Tab } from 'semantic-ui-react';
import { RenderBlocks } from '@plone/volto/components';
import { withScrollToTarget } from '@eeacms/volto-tabs-block/hocs';
import { SimpleMarkdown } from '@eeacms/volto-tabs-block/utils';

import cx from 'classnames';

import '@eeacms/volto-tabs-block/less/menu.less';

const MenuItem = (props) => {
  const { activeTab = null, tabs = {}, setActiveTab = () => {} } = props;
  const { tab, index } = props;
  const title = tabs[tab].title;

  const defaultTitle = `Tab ${index + 1}`;

  return (
    <Menu.Item
      name={defaultTitle}
      active={tab === activeTab}
      onClick={() => {
        if (activeTab !== tab) {
          setActiveTab(tab);
        }
      }}
    >
      {title ? <p>{title}</p> : <p>{defaultTitle}</p>}
    </Menu.Item>
  );
};

const View = (props) => {
  const [hashlinkOnMount, setHashlinkOnMount] = React.useState(false);
  const {
    metadata = {},
    data = {},
    tabsList = [],
    tabs = {},
    activeTabIndex = 0,
    hashlink = {},
    setActiveTab = () => {},
  } = props;
  const uiContainer = data.align === 'full' ? 'ui container' : '';
  const menuAlign = data.menuAlign || 'left';
  const tabsTitle = data.title;
  const tabsDescription = data.description;

  React.useEffect(() => {
    const urlHash = props.location.hash.substring(1) || '';
    if (
      hashlink.counter > 0 ||
      (hashlink.counter === 0 && urlHash && !hashlinkOnMount)
    ) {
      const id = hashlink.hash || urlHash || '';
      const index = tabsList.indexOf(id);
      const parentId = data.id || props.id;
      const parent = document.getElementById(parentId);
      const headerWrapper = document.querySelector('.header-wrapper');
      const offsetHeight = headerWrapper?.offsetHeight || 0;
      if (id !== parentId && index > -1 && parent) {
        if (activeTabIndex !== index) {
          setActiveTab(id);
        }
        props.scrollToTarget(parent, offsetHeight);
      } else if (id === parentId && parent) {
        props.scrollToTarget(parent, offsetHeight);
      }
    }
    if (!hashlinkOnMount) {
      setHashlinkOnMount(true);
    }
    /* eslint-disable-next-line */
  }, [hashlink.counter]);

  const panes = tabsList.map((tab, index) => {
    return {
      id: tab,
      menuItem: () => {
        return (
          <>
            {index === 0 && (tabsTitle || tabsDescription) ? (
              <Menu.Item className="menu-title">
                <SimpleMarkdown md={tabsTitle} defaultTag="##" />
                <SimpleMarkdown md={tabsDescription} />
              </Menu.Item>
            ) : (
              ''
            )}
            <MenuItem {...props} tab={tab} index={index} />
          </>
        );
      },
      render: () => {
        return (
          <Tab.Pane>
            {' '}
            <RenderBlocks {...props} metadata={metadata} content={tabs[tab]} />
          </Tab.Pane>
        );
      },
    };
  });

  return (
    <>
      <Tab
        menu={{
          className: cx(menuAlign),
        }}
        panes={panes}
        activeIndex={activeTabIndex}
        className={cx('default tabs', uiContainer)}
      />
    </>
  );
};

export default compose(
  connect((state) => {
    return {
      hashlink: state.hashlink,
    };
  }),
  withScrollToTarget,
)(withRouter(View));
