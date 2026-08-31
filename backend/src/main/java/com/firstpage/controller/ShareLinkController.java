package com.firstpage.controller;

import com.firstpage.config.AppProperties;
import com.firstpage.entity.Media;
import com.firstpage.entity.Microsite;
import com.firstpage.entity.enums.Category;
import com.firstpage.entity.enums.MediaType;
import com.firstpage.entity.enums.MicrositeStatus;
import com.firstpage.repository.MicrositeRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.util.Optional;

/**
 * Serves the canonical shareable link for a microsite.
 *
 * <p>Distribution for this product is a pasted link, so the link has to render
 * as a card in WhatsApp, iMessage, Slack and Twitter rather than as naked text.
 * The viewer is a single-page app, so {@code react-helmet-async} sets its tags
 * long after a crawler has already read the empty HTML shell and left — no
 * amount of client-side work can fix that. This endpoint returns a small
 * server-rendered document carrying the preview tags, then bounces real
 * visitors on to the app.
 *
 * <p>Deliberately does <em>not</em> record a visit: a crawler prefetching the
 * link must never burn a one-time-view page before the recipient opens it.
 */
@Tag(name = "Share", description = "Shareable link with chat and social preview tags")
@Controller
@RequiredArgsConstructor
public class ShareLinkController {

    private final MicrositeRepository micrositeRepository;
    private final AppProperties appProperties;

    @GetMapping(value = "/s/{slug}", produces = "text/html;charset=UTF-8")
    @ResponseBody
    @Transactional(readOnly = true)
    @Operation(summary = "Shareable link — preview tags for crawlers, redirect for people")
    public ResponseEntity<String> share(@PathVariable String slug) {
        Optional<Microsite> found = micrositeRepository.findBySlug(slug)
                .filter(m -> m.getStatus() == MicrositeStatus.PUBLISHED);

        // The SPA owns /p/:slug on the frontend origin; this endpoint sits on the
        // backend origin at /s/:slug so the two never shadow each other. The two
        // apps are deployed as separate origins with no shared proxy in front.
        String viewerUrl = appProperties.getFrontendBaseUrl() + "/p/" + slug;

        if (found.isEmpty()) {
            // Still bounce to the app, which renders a proper "page not found"
            // in the product's own voice.
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(document("This page isn't available",
                            "The link may have expired, or the page was never published.",
                            null, viewerUrl, shareUrl(slug)));
        }

        Microsite microsite = found.get();
        boolean locked = microsite.isPasswordProtected();

        // A locked page must not leak its title or photos into a group chat.
        String title = locked
                ? "Someone left a page for you"
                : microsite.getTitle();
        String description = locked
                ? "This one's password-protected. Open it to unlock."
                : teaserFor(microsite);
        String image = locked ? null : firstImageUrl(microsite);

        return ResponseEntity.ok(document(
                title, description, image, viewerUrl, shareUrl(slug)));
    }

    // ── Copy ─────────────────────────────────────────────────────────────

    /**
     * The one line that has to earn the tap, in the occasion's own register.
     * Recipient name is used when it is known, because "Sarah, this is for you"
     * outperforms anything generic.
     */
    private String teaserFor(Microsite microsite) {
        String name = microsite.getRecipientName();
        boolean named = name != null && !name.isBlank();
        Category category = microsite.getCategory();

        String opener = switch (category) {
            case CRUSH -> "There's something someone wanted to say.";
            case FRIENDSHIP -> "A page about everything you two have been through.";
            case APOLOGY -> "Someone would like a minute of your time.";
            case BIRTHDAY -> "Your birthday page is ready.";
            case ANNIVERSARY -> "A year of it, written down.";
            case FAREWELL -> "Before you go — one last page.";
            case PROPOSAL -> "There's a question waiting at the end.";
            case THANK_YOU -> "Someone wanted to say thank you properly.";
            case CONGRATULATIONS -> "You did it, and someone made you a page about it.";
            case FAMILY -> "A page from the people who claim you.";
            case GRADUATION -> "Cap, gown, and a page to keep.";
            case BABY_WELCOME -> "Welcome to the world — here's your first page.";
            case CUSTOM -> "Someone made this page for you.";
        };

        return named ? name + " — " + uncapitalise(opener) : opener;
    }

    private String uncapitalise(String text) {
        if (text.isEmpty()) {
            return text;
        }
        return Character.toLowerCase(text.charAt(0)) + text.substring(1);
    }

    private String firstImageUrl(Microsite microsite) {
        return microsite.getMediaItems().stream()
                .filter(m -> m.getType() == MediaType.IMAGE)
                .map(Media::getUrl)
                .findFirst()
                .orElseGet(() -> microsite.getSlides().stream()
                        .flatMap(slide -> slide.getMediaItems().stream())
                        .filter(m -> m.getType() == MediaType.IMAGE)
                        .map(Media::getUrl)
                        .findFirst()
                        .orElse(null));
    }

    private String shareUrl(String slug) {
        // Derived from the request rather than configured: this endpoint is the
        // canonical share URL, so its own origin is by definition correct — in
        // dev on :8080, and behind a reverse proxy via the forwarded headers.
        return ServletUriComponentsBuilder.fromCurrentContextPath()
                .path("/s/")
                .path(slug)
                .toUriString();
    }

    // ── Rendering ────────────────────────────────────────────────────────

    /**
     * Builds the preview document. Crawlers read the meta tags and stop; people
     * are redirected by the refresh tag and the inline script, with a plain link
     * as the last resort.
     */
    private String document(String title, String description, String imageUrl,
                            String redirectTo, String canonical) {
        String safeTitle = escapeHtml(title);
        String safeDescription = escapeHtml(description);
        String safeRedirect = escapeHtml(redirectTo);
        String safeCanonical = escapeHtml(canonical);

        StringBuilder imageTags = new StringBuilder();
        if (imageUrl != null && !imageUrl.isBlank()) {
            String safeImage = escapeHtml(imageUrl);
            imageTags.append("""
                      <meta property="og:image" content="%s">
                      <meta name="twitter:card" content="summary_large_image">
                    """.formatted(safeImage));
        } else {
            imageTags.append("""
                      <meta name="twitter:card" content="summary">
                    """);
        }

        return """
                <!DOCTYPE html>
                <html lang="en">
                <head>
                  <meta charset="utf-8">
                  <meta name="viewport" content="width=device-width, initial-scale=1">
                  <title>%s</title>
                  <link rel="canonical" href="%s">
                  <meta name="description" content="%s">
                  <meta property="og:type" content="website">
                  <meta property="og:site_name" content="FirstPage">
                  <meta property="og:title" content="%s">
                  <meta property="og:description" content="%s">
                  <meta property="og:url" content="%s">
                %s  <meta name="twitter:title" content="%s">
                  <meta name="twitter:description" content="%s">
                  <meta name="robots" content="noindex">
                  <meta http-equiv="refresh" content="0;url=%s">
                </head>
                <body style="margin:0;display:grid;place-items:center;min-height:100vh;font:16px/1.5 system-ui,sans-serif;background:#0b0e14;color:#f4e4c1">
                  <p>Opening your page… <a href="%s" style="color:#c9a227">tap here</a> if nothing happens.</p>
                  <script>location.replace(%s)</script>
                </body>
                </html>
                """.formatted(
                safeTitle, safeCanonical, safeDescription,
                safeTitle, safeDescription, safeCanonical,
                imageTags, safeTitle, safeDescription,
                safeRedirect, safeRedirect, toJsString(redirectTo));
    }

    private String escapeHtml(String value) {
        if (value == null) {
            return "";
        }
        return value.replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;")
                .replace("'", "&#39;");
    }

    /** Quotes a URL for the inline script, closing off {@code </script>} breakouts. */
    private String toJsString(String value) {
        String escaped = value == null ? "" : value
                .replace("\\", "\\\\")
                .replace("\"", "\\\"")
                .replace("<", "\\u003c")
                .replace(">", "\\u003e")
                .replace("\n", "")
                .replace("\r", "");
        return "\"" + escaped + "\"";
    }
}
