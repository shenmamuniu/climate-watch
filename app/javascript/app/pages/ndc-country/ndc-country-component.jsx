import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { renderRoutes } from 'react-router-config';
import Header from 'components/header';
import Intro from 'components/intro';
import Button from 'components/button';
import Search from 'components/search';
import cx from 'classnames';
import Sticky from 'react-stickynode';
import AnchorNav from 'components/anchor-nav';
import NdcsDocumentsMetaProvider from 'providers/ndcs-documents-meta-provider';
import Dropdown from 'components/dropdown';
import { NDC_COUNTRY } from 'data/SEO';
import { MetaDescription, SocialMetadata } from 'components/seo';
import { TabletLandscape } from 'components/responsive';

import anchorNavRegularTheme from 'styles/themes/anchor-nav/anchor-nav-regular.scss';
import theme from 'styles/themes/dropdown/dropdown-links.scss';
import lightSearch from 'styles/themes/search/search-light.scss';
import styles from './ndc-country-styles.scss';

class NDCCountry extends PureComponent {
  render() {
    const {
      country,
      match,
      onSearchChange,
      search,
      route,
      anchorLinks,
      documentsOptions,
      handleDropDownChange,
      notSummary
    } = this.props;
    const countryName = country && `${country.wri_standard_name}`;
    return (
      <div>
        <MetaDescription
          descriptionContext={NDC_COUNTRY({ countryName })}
          subtitle={countryName}
        />
        <SocialMetadata
          descriptionContext={NDC_COUNTRY({ countryName })}
          href={location.href}
        />
        <NdcsDocumentsMetaProvider />
        {country && (
          <Header route={route}>
            <div className={cx(styles.doubleFold, styles.header)}>
              <div className={styles.title}>
                <Intro title={country.wri_standard_name} />
              </div>
              <div>
                {documentsOptions &&
                  (documentsOptions.length > 1 ? (
                    <Dropdown
                      className={theme.dropdownOptionWithArrow}
                      placeholder="Select a document"
                      options={documentsOptions}
                      onValueChange={handleDropDownChange}
                      white
                      hideResetButton
                    />
                  ) : (
                    <Button
                      color="yellow"
                      link={`/ndcs/country/${match.params.iso}/full`}
                    >
                      {`View ${documentsOptions[0].label} Document`}
                    </Button>
                  ))}
              </div>
              <TabletLandscape>
                <Button
                  color="yellow"
                  link={`/ndcs/compare/mitigation?locations=${match.params
                    .iso}`}
                >
                  Compare
                </Button>
              </TabletLandscape>
              {notSummary && (
                <Search
                  theme={lightSearch}
                  placeholder="Search"
                  value={search}
                  onChange={onSearchChange}
                />
              )}
            </div>
            <Sticky activeClass="sticky -ndcs" top="#navBarMobile">
              <AnchorNav
                useRoutes
                links={anchorLinks}
                className={styles.anchorNav}
                theme={anchorNavRegularTheme}
                gradientColor={route.headerColor}
              />
            </Sticky>
          </Header>
        )}
        <div className={styles.wrapper}>{renderRoutes(route.routes)}</div>
      </div>
    );
  }
}

NDCCountry.propTypes = {
  route: PropTypes.object.isRequired,
  match: PropTypes.object.isRequired,
  country: PropTypes.object,
  onSearchChange: PropTypes.func.isRequired,
  search: PropTypes.string,
  anchorLinks: PropTypes.array,
  documentsOptions: PropTypes.array,
  handleDropDownChange: PropTypes.func,
  notSummary: PropTypes.bool
};

export default NDCCountry;
