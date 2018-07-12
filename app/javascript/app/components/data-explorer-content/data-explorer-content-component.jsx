import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import DataExplorerProvider from 'providers/data-explorer-provider/data-explorer-provider';
import RegionsProvider from 'providers/regions-provider/regions-provider';
import CountriesProvider from 'providers/countries-provider/countries-provider';
import Table from 'components/table';
import Dropdown from 'components/dropdown';
import MultiDropdown from 'components/dropdown/multi-dropdown';
import MetadataText from 'components/metadata-text';
import AnchorNav from 'components/anchor-nav';
import NoContent from 'components/no-content';
import Loading from 'components/loading';
import Button from 'components/button';
import ModalDownload from 'components/modal-download';
import anchorNavLightTheme from 'styles/themes/anchor-nav/anchor-nav-light.scss';
import { toStartCase } from 'app/utils';
import cx from 'classnames';
import { DATA_EXPLORER_MULTIPLE_LEVEL_SECTIONS } from 'data/constants';
import styles from './data-explorer-content-styles.scss';

class DataExplorerContent extends PureComponent {
  // eslint-disable-line react/prefer-stateless-function
  renderTable() {
    const { data, firstColumnHeaders, loading } = this.props;
    if (loading) return <Loading light className={styles.loader} />;
    return data ? (
      <Table
        data={data}
        rowHeight={60}
        sortBy={'region'}
        firstColumnHeaders={firstColumnHeaders}
        horizontalScroll
      />
    ) : (
      <NoContent message={'No data'} className={styles.noData} />
    );
  }

  renderMeta() {
    const { meta, loadingMeta, section } = this.props;
    if (loadingMeta) return <Loading light className={styles.loader} />;
    const noContentMessage =
      section === 'emission-pathways'
        ? 'Select a model, scenario or indicator'
        : 'Select a source';
    return meta && meta.length > 0 ? (
      meta.map((m, i) => (
        <MetadataText
          key={m.technical_title || m.full_name || m.name}
          className={cx(styles.metadataText, { [styles.topPadded]: i > 0 })}
          data={m}
          showAll
        />
      ))
    ) : (
      <NoContent message={noContentMessage} className={styles.noData} />
    );
  }

  renderFilters() {
    const {
      handleFilterChange,
      selectedOptions,
      filterOptions,
      filters,
      section,
      isDisabled
    } = this.props;

    const multipleSector = field =>
      DATA_EXPLORER_MULTIPLE_LEVEL_SECTIONS[section] &&
      DATA_EXPLORER_MULTIPLE_LEVEL_SECTIONS[section].find(s => s.key === field);
    return filters.map(
      field =>
        (multipleSector(field) ? (
          <MultiDropdown
            key={field}
            label={toStartCase(field)}
            placeholder={`Filter by ${toStartCase(field)}`}
            options={filterOptions ? filterOptions[field] : []}
            value={selectedOptions ? selectedOptions[field] : null}
            disabled={isDisabled(field)}
            clearable
            onChange={option =>
              handleFilterChange(
                field,
                option && (option.label || option.slug)
              )}
            noParentSelection={multipleSector(field).noSelectableParent}
          />
        ) : (
          <Dropdown
            key={field}
            label={toStartCase(field)}
            placeholder={`Filter by ${toStartCase(field)}`}
            options={filterOptions ? filterOptions[field] : []}
            onValueChange={selected =>
              handleFilterChange(field, selected && selected.slug)}
            value={selectedOptions ? selectedOptions[field] : null}
            plain
            disabled={isDisabled(field)}
            noAutoSort={field === 'goals' || field === 'targets'}
          />
        ))
    );
  }

  render() {
    const {
      section,
      href,
      metadataSection,
      anchorLinks,
      filterQuery,
      query,
      handleDownloadModalOpen
    } = this.props;
    return (
      <div>
        <DataExplorerProvider
          section={section}
          query={filterQuery}
          noFilters={query === ''}
        />
        <RegionsProvider />
        <CountriesProvider />
        <div className={styles.filtersContainer}>{this.renderFilters()}</div>
        <AnchorNav
          links={anchorLinks}
          theme={anchorNavLightTheme}
          query={query}
        />
        <div className={styles.tableContainer}>
          {metadataSection ? this.renderMeta() : this.renderTable()}
        </div>
        <div className={styles.buttons}>
          <Button className={styles.button} href={href} color="plain">
            View in module page
          </Button>
          <Button
            className={styles.button}
            onClick={handleDownloadModalOpen}
            color="yellow"
          >
            Download
          </Button>
        </div>
        <ModalDownload />
      </div>
    );
  }
}

DataExplorerContent.propTypes = {
  section: PropTypes.string.isRequired,
  handleFilterChange: PropTypes.func.isRequired,
  isDisabled: PropTypes.func.isRequired,
  handleDownloadModalOpen: PropTypes.func.isRequired,
  filters: PropTypes.array,
  selectedOptions: PropTypes.object,
  filterOptions: PropTypes.object,
  metadataSection: PropTypes.bool,
  data: PropTypes.array,
  meta: PropTypes.array,
  firstColumnHeaders: PropTypes.array,
  loading: PropTypes.bool,
  loadingMeta: PropTypes.bool,
  href: PropTypes.string,
  anchorLinks: PropTypes.array,
  filterQuery: PropTypes.string,
  query: PropTypes.string
};

export default DataExplorerContent;