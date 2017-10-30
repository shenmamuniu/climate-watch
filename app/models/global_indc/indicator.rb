module GlobalIndc
  class Indicator < ApplicationRecord
    has_and_belongs_to_many :categories,
                            join_table: :global_indc_indicators_categories
    belongs_to :cait_indicator,
               class_name: 'CaitIndc::Indicator',
               required: false
    belongs_to :wb_indicator,
               class_name: 'WbIndc::Indicator',
               required: false

    validate :cait_xor_wb_indicator_presence

    def cait_xor_wb_indicator_presence
      return if cait_indicator.blank? ^ wb_indicator.blank?

      errors.add(
        :base,
        'Reference either a cait or wb indicator, never both or none'
      )
    end
  end
end