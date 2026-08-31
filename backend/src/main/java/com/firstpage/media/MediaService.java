package com.firstpage.media;

import org.springframework.web.multipart.MultipartFile;

/**
 * Service interface for media file operations (upload, delete).
 */
public interface MediaService {

    /**
     * Uploads an image file to the media storage.
     *
     * @param file   the image file to upload
     * @param folder the destination folder/path
     * @return the uploaded asset's URL and provider id
     */
    UploadedAsset uploadImage(MultipartFile file, String folder);

    /**
     * Uploads a video file to the media storage.
     *
     * @param file   the video file to upload
     * @param folder the destination folder/path
     * @return the uploaded asset's URL and provider id
     */
    UploadedAsset uploadVideo(MultipartFile file, String folder);

    /**
     * Uploads an audio file — a music bed or a recorded voice note.
     *
     * <p>Separate from {@link #uploadVideo} because the two accept different
     * content types. Audio used to be routed through the video method, which
     * validates against video MIME types only, so every audio upload was
     * rejected as an invalid file type before it reached the provider.
     *
     * @param file   the audio file to upload
     * @param folder the destination folder/path
     * @return the uploaded asset's URL and provider id
     */
    UploadedAsset uploadAudio(MultipartFile file, String folder);

    /**
     * Deletes a media file by its public identifier.
     *
     * @param publicId the public identifier of the media to delete
     */
    void deleteMedia(String publicId);
}
