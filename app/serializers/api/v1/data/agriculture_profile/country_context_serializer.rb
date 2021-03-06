module Api
  module V1
    module Data
      module AgricultureProfile
        class CountryContextSerializer < ActiveModel::Serializer
          attributes :location_id, :year, :employment_agri_female, :employment_agri_male,
                     :employment_agri_total, :total_pesticides_use, :total_fertilizers,
                     :water_withdrawal, :water_withdrawal_rank, :value_added_agr,
                     :iso_code3

          def iso_code3
            object.location&.iso_code3
          end
        end
      end
    end
  end
end
