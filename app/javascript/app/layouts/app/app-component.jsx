import React, { PureComponent } from 'react';
import Proptypes from 'prop-types';
import { renderRoutes } from 'react-router-config';
import cx from 'classnames';

import CountriesProvider from 'providers/countries-provider';
import { TabletLandscape } from 'components/responsive';
import NavBarMobile from 'components/navbar-mobile';
import NavBar from 'components/navbar';
import Footer from 'components/footer';
import { HOME_PAGE } from 'data/SEO';
import { MetaDescription, SocialMetadata } from 'components/seo';

import styles from './app-styles.scss'; // eslint-disable-line

class App extends PureComponent {
  render() {
    const { route, navRoutes, location, navbarMobileIsOpen } = this.props;
    return (
      <div
        className={cx(
          styles.app,
          navbarMobileIsOpen ? styles.mobileMenuOpen : ''
        )}
      >
        <MetaDescription descriptionContext={HOME_PAGE} />
        <SocialMetadata descriptionContext={HOME_PAGE} href={location.href} />
        <CountriesProvider />
        <TabletLandscape>
          {matches =>
            (matches ? (
              <NavBar routes={navRoutes} />
            ) : (
              <NavBarMobile routes={navRoutes} />
            ))}
        </TabletLandscape>
        {renderRoutes(route.routes.filter(r => r.path))}
        <Footer />
      </div>
    );
  }
}

App.propTypes = {
  route: Proptypes.object,
  navRoutes: Proptypes.array,
  location: Proptypes.object.isRequired,
  navbarMobileIsOpen: Proptypes.bool
};

export default App;
