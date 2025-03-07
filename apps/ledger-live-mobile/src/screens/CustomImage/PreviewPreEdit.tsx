import React, { useCallback, useEffect, useRef, useState } from "react";
import { Button, Flex, InfiniteLoader, Text } from "@ledgerhq/native-ui";
import { ImagePreviewError } from "@ledgerhq/live-common/customImage/errors";
import { NativeSyntheticEvent, ImageErrorEventData } from "react-native";
import { useTranslation } from "react-i18next";
import {
  EventListenerCallback,
  EventMapCore,
  StackNavigationState,
  useFocusEffect,
} from "@react-navigation/native";
import { StackNavigationEventMap } from "@react-navigation/stack";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  BaseComposite,
  StackNavigatorProps,
} from "../../components/RootNavigator/types/helpers";
import { CustomImageNavigatorParamList } from "../../components/RootNavigator/types/CustomImageNavigator";
import { NavigatorName, ScreenName } from "../../const";
import {
  downloadImageToFile,
  importImageFromPhoneGallery,
} from "../../components/CustomImage/imageUtils";
import { ImageFileUri } from "../../components/CustomImage/types";
import { targetDimensions } from "./shared";
import FramedImage from "../../components/CustomImage/FramedImage";
import ImageProcessor, {
  Props as ImageProcessorProps,
  ProcessorPreviewResult,
  ProcessorRawResult,
} from "../../components/CustomImage/ImageProcessor";
import useCenteredImage, {
  Params as ImageCentererParams,
  CenteredResult,
} from "../../components/CustomImage/useCenteredImage";

const DEFAULT_CONTRAST = 1;

type NavigationProps = BaseComposite<
  StackNavigatorProps<
    CustomImageNavigatorParamList,
    ScreenName.CustomImagePreviewPreEdit
  >
>;

const PreviewPreEdit = ({ navigation, route }: NavigationProps) => {
  const { t } = useTranslation();
  const [loadedImage, setLoadedImage] = useState<ImageFileUri | null>(null);
  const { params } = route;
  const { isPictureFromGallery, device } = params;

  const handleError = useCallback(
    (error: Error) => {
      console.error(error);
      navigation.navigate(ScreenName.CustomImageErrorScreen, { error, device });
    },
    [navigation, device],
  );

  /** LOAD SOURCE IMAGE FROM PARAMS */
  useEffect(() => {
    let dead = false;
    if ("imageFileUri" in params) {
      setLoadedImage({
        imageFileUri: params.imageFileUri,
      });
    } else {
      const { resultPromise, cancel } = downloadImageToFile(params);
      resultPromise
        .then(res => {
          if (!dead) setLoadedImage(res);
        })
        .catch(e => {
          if (!dead) handleError(e);
        });
      return () => {
        dead = true;
        cancel();
      };
    }
    return () => {
      dead = true;
    };
  }, [params, setLoadedImage, handleError]);

  const [croppedImage, setCroppedImage] = useState<CenteredResult | null>(null);

  const handleResizeError = useCallback(
    (error: Error) => {
      console.error(error);
      navigation.navigate(ScreenName.CustomImageErrorScreen, { error, device });
    },
    [navigation, device],
  );

  /** IMAGE RESIZING */

  const handleResizeResult: ImageCentererParams["onResult"] = useCallback(
    (res: CenteredResult) => {
      setCroppedImage(res);
    },
    [setCroppedImage],
  );

  useCenteredImage({
    targetDimensions,
    imageFileUri: loadedImage?.imageFileUri,
    onError: handleResizeError,
    onResult: handleResizeResult,
  });

  /** RESULT IMAGE HANDLING */

  const [previewLoading, setPreviewLoading] = useState<boolean>(true);
  const [processorPreviewImage, setProcessorPreviewImage] =
    useState<ProcessorPreviewResult | null>(null);
  const [rawResultLoading, setRawResultLoading] = useState(false);
  const imageProcessorRef = useRef<ImageProcessor>(null);

  const handlePreviewResult: ImageProcessorProps["onPreviewResult"] =
    useCallback(
      data => {
        setProcessorPreviewImage(data);
        setPreviewLoading(false);
      },
      [setProcessorPreviewImage],
    );

  const handleRawResult: ImageProcessorProps["onRawResult"] = useCallback(
    (data: ProcessorRawResult) => {
      if (!processorPreviewImage) {
        /**
         * this should not happen as the "request raw result" button is only
         * visible once the preview is there
         * */
        throw new ImagePreviewError();
      }
      navigation.navigate(ScreenName.CustomImageStep3Transfer, {
        rawData: data,
        previewData: processorPreviewImage,
        device,
      });
      setRawResultLoading(false);
    },
    [navigation, setRawResultLoading, processorPreviewImage, device],
  );

  const handlePreviewImageError = useCallback(
    ({ nativeEvent }: NativeSyntheticEvent<ImageErrorEventData>) => {
      console.error(nativeEvent.error);
      handleError(new ImagePreviewError());
    },
    [handleError],
  );

  const requestRawResult = useCallback(() => {
    imageProcessorRef?.current?.requestRawResult();
    setRawResultLoading(true);
  }, [imageProcessorRef, setRawResultLoading]);

  useFocusEffect(
    useCallback(() => {
      let dead = false;
      const listener: EventListenerCallback<
        StackNavigationEventMap &
          EventMapCore<StackNavigationState<CustomImageNavigatorParamList>>,
        "beforeRemove"
      > = e => {
        if (!isPictureFromGallery) {
          navigation.dispatch(e.data.action);
          return;
        }
        e.preventDefault();
        setLoadedImage(null);
        setCroppedImage(null);
        setProcessorPreviewImage(null);
        setPreviewLoading(true);
        importImageFromPhoneGallery()
          .then(importResult => {
            if (dead) return;
            if (importResult !== null) {
              setLoadedImage(importResult);
            } else {
              navigation.dispatch(e.data.action);
            }
          })
          .catch(e => {
            if (dead) return;
            handleError(e);
          });
      };
      const removeListener = navigation.addListener("beforeRemove", listener);
      return () => {
        dead = true;
        removeListener();
      };
    }, [navigation, handleError, isPictureFromGallery]),
  );

  const handleEditPicture = useCallback(() => {
    if (!loadedImage) {
      /**
       * this should not happen as the "request raw result" button is only
       * visible once the preview is there
       * */
      throw new ImagePreviewError();
    }

    navigation.navigate(NavigatorName.CustomImage, {
      screen: ScreenName.CustomImageStep1Crop,
      params: {
        device,
        baseImageFile: loadedImage,
      },
    });
  }, [navigation, device, loadedImage]);

  if (!loadedImage || !loadedImage.imageFileUri) {
    return (
      <Flex flex={1} justifyContent="center" alignItems="center">
        <InfiniteLoader />
      </Flex>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }} edges={["bottom"]}>
      {croppedImage?.imageBase64DataUri && (
        <ImageProcessor
          ref={imageProcessorRef}
          imageBase64DataUri={croppedImage?.imageBase64DataUri}
          onPreviewResult={handlePreviewResult}
          onError={handleError}
          onRawResult={handleRawResult}
          contrast={DEFAULT_CONTRAST}
        />
      )}
      {previewLoading ? (
        <Flex flex={1} justifyContent="center" alignItems="center">
          <InfiniteLoader />
          <Text variant="body" color="neutral.c80" mt={6}>
            {t("customImage.preview.loading")}
          </Text>
        </Flex>
      ) : (
        <Flex flex={1}>
          <Flex flex={1}>
            <Flex
              flex={1}
              flexDirection="column"
              alignItems="center"
              justifyContent="center"
            >
              <FramedImage
                onError={handlePreviewImageError}
                fadeDuration={0}
                source={{ uri: processorPreviewImage?.imageBase64DataUri }}
              />
            </Flex>
          </Flex>
          <Flex px={8}>
            <Button
              type="main"
              size="large"
              outline
              mb={4}
              disabled={previewLoading}
              pending={rawResultLoading}
              onPress={requestRawResult}
              displayContentWhenPending
            >
              {t("customImage.preview.setPicture")}
            </Button>
            <Button
              size="large"
              mb={8}
              onPress={handleEditPicture}
              disabled={previewLoading}
            >
              {t("customImage.preview.editPicture")}
            </Button>
          </Flex>
        </Flex>
      )}
    </SafeAreaView>
  );
};

export default PreviewPreEdit;
