import React from 'react';
import PropTypes from 'prop-types';
import LandAreaProvider from 'providers/agriculture-land-area-provider';
import { SunburstChart, Card, Tag, Icon } from 'cw-components';
import infoIcon from 'assets/icons/info';
import Tooltip from './tooltip';

import styles from './land-area-styles.scss';

const cardTheme = {
  card: styles.card,
  data: styles.data
};

const renderTag = (chartConfig, key) => (
  <Tag
    theme={{ tag: styles.tag, label: styles.label }}
    key={chartConfig.theme[key].label}
    canRemove={false}
    label={chartConfig.theme[key].label}
    color={chartConfig.theme[key].stroke}
  />
);

const LandArea = ({
  selectedCountry,
  selectedYear,
  chartData,
  chartColors,
  chartConfig,
  firstLevelLegend,
  handleInfoBtnClick
}) => (
  <div className={styles.container}>
    {chartData && (
      <Card
        key={'Share in Land Area'}
        title={'Share in Land Area'}
        theme={cardTheme}
      >
        <div className={styles.cardContainer}>
          <div className={styles.header}>
            <div className={styles.title}>
              Share of different types of agricultural land as a percentage of
              total land area in a country. Depending on agricultural intensity,
              countries devote a different amount of land to agriculture.
            </div>
            <Icon
              icon={infoIcon}
              theme={{ icon: styles.cardInfoIcon }}
              onClick={handleInfoBtnClick}
            />
          </div>
          <div className={styles.chartContainer}>
            <div className={styles.legend}>
              {firstLevelLegend &&
                firstLevelLegend.map(q => (
                  <React.Fragment>
                    {renderTag(chartConfig, q)}
                    {chartConfig.theme[q].children &&
                      chartConfig.theme[q].children.map(nestedTag => (
                        <div className={styles.nestedLegend}>
                          {renderTag(chartConfig, nestedTag)}
                        </div>
                      ))}
                  </React.Fragment>
                ))}
            </div>
            <div className={styles.chart}>
              {chartData &&
              chartColors &&
              chartConfig && (
              <SunburstChart
                    data={chartData}
                    customTooltip={<Tooltip />}
                    width={250}
                    height={250}
                    colors={chartColors}
                    config={chartConfig}
                  />
                )}
            </div>
          </div>
        </div>
        <div className={styles.yearData}>
          <span>{selectedYear && selectedYear.value}</span> data
        </div>
      </Card>
    )}
    {selectedCountry &&
    selectedYear && (
    <LandAreaProvider
          params={{ country: selectedCountry.value, year: selectedYear.value }}
        />
      )}
  </div>
);

LandArea.propTypes = {
  selectedCountry: PropTypes.object,
  selectedYear: PropTypes.object,
  chartData: PropTypes.array,
  chartColors: PropTypes.object,
  chartConfig: PropTypes.object,
  firstLevelLegend: PropTypes.array,
  handleInfoBtnClick: PropTypes.func
};

export default LandArea;
