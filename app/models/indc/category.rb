module Indc
  class Category < ApplicationRecord
    belongs_to :category_type, class_name: 'Indc::CategoryType'
    belongs_to :parent,
               class_name: 'Indc::Category',
               foreign_key: :parent_id,
               required: false
    has_many :children,
             class_name: 'Indc::Category',
             foreign_key: :parent_id
    has_and_belongs_to_many :indicators,
                            join_table: :indc_indicators_categories

    validates :slug, presence: true
    validates :name, presence: true
    validates :slug, uniqueness: {scope: :category_type}
  end
end
