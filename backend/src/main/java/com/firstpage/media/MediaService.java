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
     * @return the public URL of the uploaded image
     */
    String uploadImage(MultipartFile file, String folder);

    /**
     * Uploads a video file to the media storage.
     *
     * @param file   the video file to upload
     * @param folder the destination folder/path
     * @return the public URL of the uploaded video
     */
    String uploadVideo(MultipartFile file, String folder);

    /**
     * Deletes a media file by its public identifier.
     *
     * @param publicId the public identifier of the media to delete
     */
    void deleteMedia(String publicId);
}
