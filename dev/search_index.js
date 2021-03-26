var documenterSearchIndex = {"docs":
[{"location":"cib/#Cosmic-Infrared-Background-(CIB)","page":"CIB","title":"Cosmic Infrared Background (CIB)","text":"","category":"section"},{"location":"cib/","page":"CIB","title":"CIB","text":"We provide the Planck 2013 CIB model. The following code is a little more verbose than typical Julia code, as one has to repeatedly specify the type Float32 when creating objects. This allows one to more easily fit the entire source catalog into memory.","category":"page"},{"location":"cib/#Sources","page":"CIB","title":"Sources","text":"","category":"section"},{"location":"cib/","page":"CIB","title":"CIB","text":"One first loads the halo positions and masses into memory. This package takes halo positions in the shape (3 N_mathrmhalos), where the first dimension is the Cartesian coordinates x y z.","category":"page"},{"location":"cib/","page":"CIB","title":"CIB","text":"using XGPaint\nusing Healpix\n\n## Load halos from HDF5 files, establish a CIB model and cosmology\nwebsky_directory = \"/global/cfs/cdirs/sobs/www/users/Radio_WebSky\"\nhalo_pos, halo_mass = read_halo_catalog_hdf5(\n    \"$(websky_directory)/websky_halos-light.hdf5\")","category":"page"},{"location":"cib/","page":"CIB","title":"CIB","text":"Now one specifes the background cosmology and the source model CIB_Planck2013.","category":"page"},{"location":"cib/","page":"CIB","title":"CIB","text":"# configuration objects\ncosmo = get_cosmology(Float32; h=0.7, OmegaM=0.25)\nmodel = CIB_Planck2013{Float32}()\n\n# generate sources (healpix pixel, luminosities, etc. \n@time sources = generate_sources(model, cosmo, halo_pos, halo_mass);","category":"page"},{"location":"cib/","page":"CIB","title":"CIB","text":"This sources is a NamedTuple with arrays for centrals,","category":"page"},{"location":"cib/","page":"CIB","title":"CIB","text":"hp_ind_cen: healpix index of the central\nlum_cen: luminosity of the central\nredshift_cen: redshift of the central\ndist_cen: distance to the central","category":"page"},{"location":"cib/","page":"CIB","title":"CIB","text":"There are additionally arrays for the satellites,","category":"page"},{"location":"cib/","page":"CIB","title":"CIB","text":"hp_ind_sat: healpix index of the satellite\nlum_sat: luminosity of the satellite\nredshift_sat: redshift of the satellite\ndist_sat: distance to the satellite","category":"page"},{"location":"cib/","page":"CIB","title":"CIB","text":"There are also two integers in sources  for the total number of centrals N_cen and total number of satellites N_sat.","category":"page"},{"location":"cib/#Map-making","page":"CIB","title":"Map-making","text":"","category":"section"},{"location":"cib/","page":"CIB","title":"CIB","text":"Once these sources are generated, one needs to create some buffer arrays for map-making. The fluxes of the centrals and satellites are deposited into these arrays, before the map is generated.","category":"page"},{"location":"cib/","page":"CIB","title":"CIB","text":"# Create some empty arrays for the fluxes to be deposited\nfluxes_cen = Array{Float32, 1}(undef, sources.N_cen)\nfluxes_sat = Array{Float32, 1}(undef, sources.N_sat)\nm = Map{Float64,RingOrder}(model.nside)  # create a Healpix map","category":"page"},{"location":"cib/","page":"CIB","title":"CIB","text":"These arrays are used by paint! to create maps. We then save those to disk. We add a time macro to get some info on how long it takes. Note that with NERSC's notoriously slow filesystem, writing to disk can take as long as generating the maps!","category":"page"},{"location":"cib/","page":"CIB","title":"CIB","text":"for freq in [\"100\", \"143\", \"217\" \"353\", \"545\"]\n    @time paint!(m, parse(Float32, freq) * 1.0f9, model, \n        sources, fluxes_cen, fluxes_sat)\n    saveToFITS(m, \"!/global/cscratch1/sd/xzackli/cib/cib$(freq).fits\")\nend","category":"page"},{"location":"cib/#Custom-Models","page":"CIB","title":"Custom Models","text":"","category":"section"},{"location":"cib/","page":"CIB","title":"CIB","text":"You can make changes while reusing the XGPaint infrastructure by using Julia's multiple dispatch. Create a custom type that inherits from AbstractCIBModel. You must import the function you want to replace, and then write your own version of the function which dispatches on your custom type.","category":"page"},{"location":"cib/","page":"CIB","title":"CIB","text":" # import AbstractCIBModel and the functions you want to replace\nimport XGPaint: AbstractCIBModel, shang_z_evo \nusing Parameters, Cosmology\n\n# write your own type that is a subtype of AbstractCIBModel\n@with_kw struct CustomCIB{T<:Real} <: AbstractCIBModel{T} @deftype T\n    nside::Int64    = 4096\n    hod::String     = \"shang\"\n    Inu_norm     = 0.3180384\n    min_redshift = 0.0\n    max_redshift = 5.0\n    min_mass     = 1e12\n    box_size     = 40000\n\n    # shang HOD\n    shang_zplat  = 2.0\n    shang_Td     = 20.7\n    shang_beta   = 1.6\n    shang_eta    = 2.4\n    shang_alpha  = 0.2\n    shang_Mpeak  = 10^12.3\n    shang_sigmaM = 0.3\n    shang_Msmin  = 1e11\n    shang_Mmin   = 1e10\n    shang_I0     = 46\n\n    # jiang\n    jiang_gamma_1    = 0.13\n    jiang_alpha_1    = -0.83\n    jiang_gamma_2    = 1.33\n    jiang_alpha_2    = -0.02\n    jiang_beta_2     = 5.67\n    jiang_zeta       = 1.19\nend\n\n# dispatch on custom type CustomCIB. this particular change sets L=0\nfunction shang_z_evo(z::T, model::CustomCIB) where T\n    return zero(T)\nend\n\n# make a cosmology and our custom source model\ncosmo = get_cosmology(Float32; h=0.7, OmegaM=0.3)\ncustom_model = CustomCIB{Float32}()\n\n# for this test, do it only on a subset of the halos\nsources = generate_sources(custom_model, cosmo, halo_pos[:,1:10], halo_mass[1:10])\n\nprint(sources.lum_cen)","category":"page"},{"location":"cib/","page":"CIB","title":"CIB","text":"This particular change zeros out the luminosities, and indeed you should see the result is an array of zeroes.","category":"page"},{"location":"cib/#API","page":"CIB","title":"API","text":"","category":"section"},{"location":"cib/","page":"CIB","title":"CIB","text":"CIB_Planck2013\ngenerate_sources(\n        model::XGPaint.AbstractCIBModel{T}, cosmo::Cosmology.FlatLCDM{T},\n        halo_pos_inp::AbstractArray{TH,2}, halo_mass_inp::AbstractArray{TH,1};\n        verbose=true) where {T, TH}\npaint!(result_map::Healpix.Map{T_map, RingOrder},\n        nu_obs, model::XGPaint.AbstractCIBModel{T}, sources,\n        fluxes_cen::AbstractArray, fluxes_sat::AbstractArray) where {T_map, T}","category":"page"},{"location":"cib/#XGPaint.CIB_Planck2013","page":"CIB","title":"XGPaint.CIB_Planck2013","text":"CIB_Planck2013{T}(; kwargs...)\n\nDefine CIB model parameters. Defaults are from Viero et al. 2013. All numbers not typed are converted to type T. This model has the following parameters and default values:\n\nnside::Int64 = 4096\nhod::String = \"shang\"\nInu_norm = 0.3180384\nmin_redshift = 0.0\nmax_redshift = 5.0\nmin_mass = 1e12\nbox_size = 40000\nshang_zplat = 2.0\nshang_Td = 20.7\nshang_betan = 1.6\nshang_eta = 2.4\nshang_alpha = 0.2\nshang_Mpeak = 10^12.3\nshang_sigmaM = 0.3\nshang_Msmin = 1e11\nshang_Mmin = 1e10\nshang_I0 = 46\njiang_gamma_1 = 0.13\njiang_alpha_1 = -0.83\njiang_gamma_2 = 1.33\njiang_alpha_2 = -0.02\njiang_beta_2 = 5.67\njiang_zeta = 1.19\n\nmodel = CIB_Planck2013{Float32}(shang_Mpeak=10^12.4)\n\n\n\n\n\n","category":"type"},{"location":"cib/#XGPaint.generate_sources-Union{Tuple{TH}, Tuple{T}, Tuple{XGPaint.AbstractCIBModel{T}, Cosmology.FlatLCDM{T}, AbstractMatrix{TH}, AbstractVector{TH}}} where {T, TH}","page":"CIB","title":"XGPaint.generate_sources","text":"generate_sources(model, cosmo, halo_pos_inp, halo_mass_inp; verbose=true)\n\nProduce a source catalog from a model and halo catalog. This converts the halo arrays into the type specified by model.\n\nArguments:\n\nmodel::AbstractCIBModel{T}: source model parameters\ncosmo::Cosmology.FlatLCDM{T}: background cosmology\nHealpix_res::Resolution: Healpix map resolution\nhalo_pos_inp::AbstractArray{TH,2}: halo positions with dims (3, nhalos)\nhalo_mass_inp::AbstractArray{TH,1}: halo masses\n\nKeywords\n\nverbose::Bool=true: print out progress details\n\n\n\n\n\n","category":"method"},{"location":"cib/#XGPaint.paint!-Union{Tuple{T}, Tuple{T_map}, Tuple{Map{T_map, RingOrder, AA} where AA<:AbstractVector{T_map}, Any, XGPaint.AbstractCIBModel{T}, Any, AbstractArray, AbstractArray}} where {T_map, T}","page":"CIB","title":"XGPaint.paint!","text":"paint!(result_map, nu_obs, model, sources, fluxes_cen, fluxes_sat)\n\nPaint a source catalog onto a map, recording the fluxes in fluxes_cen and fluxes_sat.\n\nArguments:\n\nresult_map::Map{T_map, RingOrder}: Healpix map to paint\nnu_obs: frequency in Hz\nmodel::AbstractCIBModel{T}: source model parameters\nsources: NamedTuple containing source information from generate_sources\nfluxes_cen::AbstractArray: buffer for writing fluxes of centrals\nfluxes_sat::AbstractArray: buffer for writing fluxes of satellites\n\n\n\n\n\n","category":"method"},{"location":"api/#Index","page":"Index","title":"Index","text":"","category":"section"},{"location":"api/","page":"Index","title":"Index","text":"","category":"page"},{"location":"","page":"Home","title":"Home","text":"CurrentModule = XGPaint","category":"page"},{"location":"#XGPaint","page":"Home","title":"XGPaint","text":"","category":"section"},{"location":"","page":"Home","title":"Home","text":"XGPaint paints maps of extragalactic foregrounds using halo models. We provide CIB and radio models. The CIB model is described in the Websky paper, Stein et al. 2020. The radio model is from Li et al. 2021, a paper in prep for the Websky suite, and is derived from Sehgal et al. 2009.","category":"page"},{"location":"","page":"Home","title":"Home","text":"The general workflow is:","category":"page"},{"location":"","page":"Home","title":"Home","text":"Read halos\nGenerate a background cosmology and source model\nUse the model to put sources in halos\nPut the sources on maps","category":"page"},{"location":"#General-Methods","page":"Home","title":"General Methods","text":"","category":"section"},{"location":"","page":"Home","title":"Home","text":"There are a few functions that are generally applicable for all foreground models.","category":"page"},{"location":"","page":"Home","title":"Home","text":"read_halo_catalog_hdf5\nget_cosmology","category":"page"},{"location":"#XGPaint.read_halo_catalog_hdf5","page":"Home","title":"XGPaint.read_halo_catalog_hdf5","text":"read_halo_catalog_hdf5(filename)\n\nUtility function to read an HDF5 table with x, y, z, M_h as the four rows. The hdf5 record is \"halos\". This is a format we use to distribute Websky halos.\n\nExample\n\njulia> halo_pos, halo_mass = read_halo_catalog_hdf5(\n    \"/global/cfs/cdirs/sobs/www/users/Radio_WebSky/websky_halos-light.hdf5\")\n\n\n\n\n\n","category":"function"},{"location":"#XGPaint.get_cosmology","page":"Home","title":"XGPaint.get_cosmology","text":"get_cosmology(::Type{T}; h=0.69, Neff=3.04, OmegaK=0.0,\n    OmegaM=0.29, OmegaR=nothing, Tcmb=2.7255, w0=-1, wa=0)\n\nConstruct a background cosmology. This function duplicates the cosmology() function in Cosmology.jl, but with typing. This is primarily for keeping the code entirely in Float32 or Float64.\n\nArguments:\n\n::Type{T}: numerical type to use for calculations\n\nKeywords\n\nh - Dimensionless Hubble constant\nOmegaK - Curvature density (Ω_k)\nOmegaM - Matter density (Ω_m)\nOmegaR - Radiation density (Ω_r)\nTcmb - CMB temperature in Kelvin; used to compute Ω_γ\nNeff - Effective number of massless neutrino species; used to compute Ω_ν\nw0 - CPL dark energy equation of state; w = w0 + wa(1-a)\nwa - CPL dark energy equation of state; w = w0 + wa(1-a)\n\nExample\n\njulia> get_cosmology(Float32; h=0.7)\nCosmology.FlatLCDM{Float32}(0.7f0, 0.7099147f0, 0.29f0, 8.5307016f-5)\n\n\n\n\n\n","category":"function"}]
}
