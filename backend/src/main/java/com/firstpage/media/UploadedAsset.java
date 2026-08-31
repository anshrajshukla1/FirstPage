package com.firstpage.media;

/**
 * What the storage provider returns after a successful upload.
 *
 * <p>The public id used to be recovered by parsing it back out of the URL, which
 * worked only by luck: a failed parse left it null, and a null public id makes
 * the delete path skip the provider entirely and leak the file. Cloudinary hands
 * the id back in the same response as the URL, so it is carried rather than
 * reconstructed.
 *
 * @param url      the public, CDN-served URL of the asset
 * @param publicId the provider's own identifier, needed to delete it later
 */
public record UploadedAsset(String url, String publicId) {}
