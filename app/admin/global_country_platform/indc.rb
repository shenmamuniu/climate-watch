ActiveAdmin.register_page 'Global Cw Platform Indc' do
  include SharedAdmin

  section_name = 'indc'
  platform_name = 'global_cw_platform'

  controller do
    def section_name
      'indc'
    end

    def platform_name
      'global_cw_platform'
    end

    def s3_folder_path
      "#{CW_FILES_PREFIX_TEST}indc"
    end

    def path
      admin_global_cw_platform_indc_path
    end

    def datasets
      Admin::Dataset.joins(:section).
        where(sections: {name: section_name}).
        where(sections: {platform_id: Admin::Platform.find_by(name: platform_name).id})
    end

    def section
      Admin::Section.
        where(name: section_name).
        find_by(platform_id: Admin::Platform.find_by(name: platform_name).id)
    end

    def import_worker
      ImportIndcWorker.perform_async(section.id)
    end
  end

  menu parent: 'Climate Watch Global',
       label: section_name.capitalize,
       if: proc { Admin::Ability.can_view?(platform_name) }

  datasets = Admin::Dataset.joins(:section).
    where(sections: {name: section_name}).
    where(sections: {platform_id: Admin::Platform.find_by(name: platform_name).id})

  section = Admin::Section.
    where(name: section_name).
    find_by(platform_id: Admin::Platform.find_by(name: platform_name).id)

  content do
    render partial: 'admin/form_upload_datasets', locals: {
      datasets: datasets,
      upload_path: admin_global_cw_platform_indc_upload_datafile_path,
      download_path: admin_global_cw_platform_indc_download_datafiles_path,
      download_single_data_file_path: admin_global_cw_platform_indc_download_datafile_path,
      import_path: admin_global_cw_platform_indc_run_importer_path,
      import_button_disabled: section.worker_logs.started.any?,
      logs: section.worker_logs.order(created_at: :desc)
    }
  end
end
