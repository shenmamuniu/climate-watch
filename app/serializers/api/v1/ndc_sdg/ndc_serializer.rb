module Api
  module V1
    module NdcSdg
      class NdcSerializer < ActiveModel::Serializer
        include Rails.application.routes.url_helpers

        attribute :iso_code3
        attribute :links
        attribute :sectors
        attribute :sdgs

        def iso_code3
          object.first.location.iso_code3
        end

        def links
          {self: sdgs_api_v1_ndc_path(code: iso_code3)}
        end

        def sectors
          sectors = object.
            flat_map(&:ndc_targets).
            flat_map(&:sectors)

          IndexedSerializer.serialize(
            sectors,
            serializer: Api::V1::NdcSdg::SectorSerializer,
            &:id
          )
        end

        def sdgs
          ndc_targets = object.
            flat_map(&:ndc_targets)

          goals = ndc_targets.
            map(&:target).
            map(&:goal)

          IndexedSerializer.serialize(
            goals,
            ndc_targets: ndc_targets,
            serializer: Api::V1::NdcSdg::SdgsSerializer,
            &:number
          )
        end
      end
    end
  end
end
