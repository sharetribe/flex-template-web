import React from 'react';
import PropTypes from 'prop-types';
import { intlShape } from 'react-intl';
import routeConfiguration from '../../routeConfiguration';
import css from './EditListingWizard.css';

import {
  LISTING_PAGE_PARAM_TYPE_DRAFT,
  LISTING_PAGE_PARAM_TYPE_NEW,
  LISTING_PAGE_PARAM_TYPES,
} from '../../util/urlHelpers';

import { ensureListing } from '../../util/data';
import { createResourceLocatorString } from '../../util/routes';

import {
  EditListingAvailabilityPanel,
  EditListingCapacityPanel,
  EditListingDescriptionPanel,
  EditListingFeaturesPanel,
  EditListingLocationPanel,
  EditListingPhotosPanel,
  EditListingPoliciesPanel,
  EditListingPricingPanel,
  EditListingHomePanel,
} from '../../components';

export const AVAILABILITY = 'availability';
export const DESCRIPTION = 'description';
export const FEATURES = 'features';
export const CAPACITY = 'capacity';
export const POLICY = 'policy';
export const LOCATION = 'location';
export const PRICING = 'pricing';
export const VIDEO = 'video';
export const PHOTOS = 'photos';
export const HOME = 'home';

// EditListingWizardTab component supports these tabs
export const SUPPORTED_TABS = [
  DESCRIPTION,
  FEATURES,
  HOME,
  LOCATION,
  AVAILABILITY,
  PRICING,
  CAPACITY,
  PHOTOS,
  POLICY,
  VIDEO
];

const pathParamsToNextTab = (params, tab, marketplaceTabs) => {
  const nextTabIndex = marketplaceTabs.findIndex(s => s === tab) + 1;
  const nextTab =
    nextTabIndex < marketplaceTabs.length
      ? marketplaceTabs[nextTabIndex]
      : marketplaceTabs[marketplaceTabs.length - 1];
  return { ...params, tab: nextTab };
};

// When user has update draft listing, he should be redirected to next EditListingWizardTab
const redirectAfterDraftUpdate = (listingId, params, tab, marketplaceTabs, history) => {
  const currentPathParams = {
    ...params,
    type: LISTING_PAGE_PARAM_TYPE_DRAFT,
    id: listingId,
  };
  const routes = routeConfiguration();

  // Replace current "new" path to "draft" path.
  // Browser's back button should lead to editing current draft instead of creating a new one.
  if (params.type === LISTING_PAGE_PARAM_TYPE_NEW) {
    const draftURI = createResourceLocatorString('EditListingPage', routes, currentPathParams, {});
    history.replace(draftURI);
  }

  // Redirect to next tab
  const nextPathParams = pathParamsToNextTab(currentPathParams, tab, marketplaceTabs);
  const to = createResourceLocatorString('EditListingPage', routes, nextPathParams, {});
  history.push(to);
};

const EditListingWizardTab = props => {
  const {
    tab,
    marketplaceTabs,
    params,
    errors,
    fetchInProgress,
    newListingPublished,
    history,
    images,
    availability,
    listing,
    handleCreateFlowTabScrolling,
    handlePublishListing,
    onUpdateListing,
    onCreateListingDraft,
    onImageUpload,
    onUpdateImageOrder,
    onRemoveImage,
    onChange,
    updatedTab,
    updateInProgress,
    intl,
    user_type,
    currentUser,
  } = props;

  const { type } = params;
  const isNewURI = type === LISTING_PAGE_PARAM_TYPE_NEW;
  const isDraftURI = type === LISTING_PAGE_PARAM_TYPE_DRAFT;
  const isNewListingFlow = isNewURI || isDraftURI;

  const currentListing = ensureListing(listing);
  const imageIds = images => {
    return images ? images.map(img => img.imageId || img.id) : null;
  };

  const onCompleteEditListingWizardTab = (tab, updateValues) => {
    // Normalize images for API call
    const { images: updatedImages, ...otherValues } = updateValues;
    const imageProperty =
      typeof updatedImages !== 'undefined' ? { images: imageIds(updatedImages) } : {};
    const updateValuesWithImages = { ...otherValues, ...imageProperty };

    if (isNewListingFlow) {
      const onUpsertListingDraft = isNewURI
        ? (tab, updateValues) => onCreateListingDraft(updateValues)
        : onUpdateListing;

      const upsertValues = isNewURI
        ? updateValuesWithImages
        : { ...updateValuesWithImages, id: currentListing.id };

      onUpsertListingDraft(tab, upsertValues)
        .then(r => {
          if (tab !== marketplaceTabs[marketplaceTabs.length - 1]) {
            // Create listing flow: smooth scrolling polyfill to scroll to correct tab
            handleCreateFlowTabScrolling(false);

            // After successful saving of draft data, user should be redirected to next tab
            redirectAfterDraftUpdate(r.data.data.id.uuid, params, tab, marketplaceTabs, history);
          } else {
            handlePublishListing(currentListing.id);
          }
        })
        .catch(e => {
          // No need for extra actions
        });
    } else {
      onUpdateListing(tab, { ...updateValuesWithImages, id: currentListing.id });
    }
  };

  const panelProps = tab => {
    return {
      className: css.panel,
      errors,
      listing,
      onChange,
      panelUpdated: updatedTab === tab,
      updateInProgress,
      user_type,
      currentUser,
    };
  };

  var submitButtonTranslationKey;
  switch (tab) {
    case DESCRIPTION: {
      submitButtonTranslationKey = isNewListingFlow
        ? 'EditListingWizard.saveNewDescription'
        : 'EditListingWizard.saveEditDescription';
      return (
        <EditListingDescriptionPanel
          {...panelProps(DESCRIPTION)}
          submitButtonText={intl.formatMessage({ id: submitButtonTranslationKey })}
          onSubmit={values => {
            onCompleteEditListingWizardTab(tab, values);
          }}
        />
      );
    }
    case FEATURES: {
      if (isNewListingFlow) {
        if (user_type == 1) {
          submitButtonTranslationKey = 'EditListingWizard.saveNewFeaturesSitter';
        }
        else if (user_type == 0) {
          submitButtonTranslationKey = 'EditListingWizard.saveNewFeatures';
        } else {
          submitButtonTranslationKey = 'EditListingWizard.saveNewHome';
        }
      } else {
        if (user_type == 1) {
          submitButtonTranslationKey = 'EditListingWizard.EditFeaturesSitter';
        } else if (user_type == 0) {
          submitButtonTranslationKey = 'EditListingWizard.saveEditHome';
        } else {
          submitButtonTranslationKey = 'EditListingWizard.saveEditPetTypes';
        }
      }
      return (
        <EditListingFeaturesPanel
          {...panelProps(FEATURES)}
          submitButtonText={intl.formatMessage({ id: submitButtonTranslationKey })}
          onSubmit={values => {
            onCompleteEditListingWizardTab(tab, values);
          }}
        />
      );
    }
    case HOME: {
      submitButtonTranslationKey = isNewListingFlow
        ? 'EditListingWizard.saveNewHome'
        : 'EditListingWizard.saveEditHome';
      return (
        <EditListingHomePanel
          {...panelProps(HOME)}
          submitButtonText={intl.formatMessage({ id: submitButtonTranslationKey })}
          onSubmit={values => {
            onCompleteEditListingWizardTab(tab, values);
          }}
        />
      );
    }
    case CAPACITY: {
      const submitButtonTranslationKey = isNewListingFlow
        ? 'EditListingWizard.saveNewCapacity'
        : 'EditListingWizard.saveEditCapacity';
      return (
        <EditListingCapacityPanel
          {...panelProps(CAPACITY)}
          submitButtonText={intl.formatMessage({ id: submitButtonTranslationKey })}
          onSubmit={values => {
            onCompleteEditListingWizardTab(tab, values);
          }}
        />
      );
    }
    case POLICY: {
      submitButtonTranslationKey = isNewListingFlow
        ? 'EditListingWizard.saveNewPolicies'
        : 'EditListingWizard.saveEditPolicies';
      return (
        <EditListingPoliciesPanel
          {...panelProps(POLICY)}
          submitButtonText={intl.formatMessage({ id: submitButtonTranslationKey })}
          onSubmit={values => {
            onCompleteEditListingWizardTab(tab, values);
          }}
        />
      );
    }
    case LOCATION: {
      if (user_type == 1) {
        submitButtonTranslationKey = isNewListingFlow
          ? 'EditListingWizard.saveNewLocation'
          : 'EditListingWizard.saveEditLocation';
      }
      else if (user_type == 0) {
        submitButtonTranslationKey = isNewListingFlow
          ? 'EditListingWizard.EditLocationOwner'
          : 'EditListingWizard.SaveLocationOwner';
      } else {
        submitButtonTranslationKey = isNewListingFlow
          ? 'EditListingWizard.saveNewLocationService'
          : 'EditListingWizard.saveEditLocation';
      }

      return (
        <EditListingLocationPanel
          {...panelProps(LOCATION)}
          submitButtonText={intl.formatMessage({ id: submitButtonTranslationKey })}
          onSubmit={values => {
            onCompleteEditListingWizardTab(tab, values);
          }}
        />
      );
    }
    case PRICING: {
      submitButtonTranslationKey = isNewListingFlow
        ? 'EditListingWizard.saveNewPricing'
        : 'EditListingWizard.saveEditPricing';
      return (
        <EditListingPricingPanel
          {...panelProps(PRICING)}
          submitButtonText={intl.formatMessage({ id: submitButtonTranslationKey })}
          onSubmit={values => {
            onCompleteEditListingWizardTab(tab, values);
          }}
        />
      );
    }
    case AVAILABILITY: {
      if (user_type) {
        submitButtonTranslationKey = isNewListingFlow
          ? 'EditListingWizard.saveNewAvailability'
          : 'EditListingWizard.saveEditAvailability';
      } else {
        submitButtonTranslationKey = isNewListingFlow
          ? 'EditListingWizard.saveNewPricing'
          : 'EditListingWizard.saveEditAvailability';
      }
      return (
        <EditListingAvailabilityPanel
          {...panelProps(AVAILABILITY)}
          availability={availability}
          submitButtonText={'Save Dates'}
          onSubmit={values => {
            onCompleteEditListingWizardTab(tab, values);
          }}
        />
      );
    }
    case PHOTOS: {
      submitButtonTranslationKey = isNewListingFlow
        ? 'EditListingWizard.saveNewPhotos'
        : 'EditListingWizard.saveEditPhotos';

      // newListingPublished and fetchInProgress are flags for the last wizard tab
      return (
        <EditListingPhotosPanel
          {...panelProps(PHOTOS)}
          submitButtonText={intl.formatMessage({ id: submitButtonTranslationKey })}
          newListingPublished={newListingPublished}
          fetchInProgress={fetchInProgress}
          images={images}
          onImageUpload={onImageUpload}
          onRemoveImage={onRemoveImage}
          onSubmit={values => {
            onCompleteEditListingWizardTab(tab, values);
          }}
          onUpdateImageOrder={onUpdateImageOrder}
        />
      );
    }
    default:
      return null;
  }
};

EditListingWizardTab.defaultProps = {
  listing: null,
  updatedTab: null,
};

const { array, bool, func, object, oneOf, shape, string } = PropTypes;

EditListingWizardTab.propTypes = {
  params: shape({
    id: string.isRequired,
    slug: string.isRequired,
    type: oneOf(LISTING_PAGE_PARAM_TYPES).isRequired,
    // tab: oneOf(SUPPORTED_TABS).isRequired,
  }).isRequired,
  errors: shape({
    createListingDraftError: object,
    publishListingError: object,
    updateListingError: object,
    showListingsError: object,
    uploadImageError: object,
  }).isRequired,
  fetchInProgress: bool.isRequired,
  newListingPublished: bool.isRequired,
  history: shape({
    push: func.isRequired,
    replace: func.isRequired,
  }).isRequired,
  images: array.isRequired,
  availability: object.isRequired,

  // We cannot use propTypes.listing since the listing might be a draft.
  listing: shape({
    attributes: shape({
      publicData: object,
      description: string,
      geolocation: object,
      pricing: object,
      title: string,
    }),
    images: array,
  }),

  handleCreateFlowTabScrolling: func.isRequired,
  handlePublishListing: func.isRequired,
  onUpdateListing: func.isRequired,
  onCreateListingDraft: func.isRequired,
  onImageUpload: func.isRequired,
  onUpdateImageOrder: func.isRequired,
  onRemoveImage: func.isRequired,
  onChange: func.isRequired,
  updatedTab: string,
  updateInProgress: bool.isRequired,

  intl: intlShape.isRequired,
};

export default EditListingWizardTab;
