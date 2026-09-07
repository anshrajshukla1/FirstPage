package com.firstpage.dto.response;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.json.JsonMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.firstpage.entity.enums.Category;
import com.firstpage.entity.enums.MicrositeStatus;
import com.firstpage.entity.enums.NotificationType;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Locks the JSON key names of the {@code is}-prefixed boolean record
 * components.
 *
 * <p>Standard JavaBeans naming would turn an {@code isRead()} accessor into a
 * property called {@code read}. The TypeScript client reads {@code isRead},
 * {@code isPasswordProtected} and friends, and a silent rename here would not
 * fail any compile step — it would just make every flag arrive as
 * {@code undefined}, so unread notifications look read and password-protected
 * pages skip their gate. These assertions are the only thing standing between
 * a Jackson upgrade and that class of bug.
 */
class JsonContractTest {

    /** Mirrors Boot's auto-configured mapper: modules on the classpath (JSR-310) registered. */
    private final ObjectMapper mapper = JsonMapper.builder().findAndAddModules().build();

    private ObjectNode serialize(Object value) throws Exception {
        return (ObjectNode) mapper.readTree(mapper.writeValueAsString(value));
    }

    @Test
    void notificationResponseKeepsIsReadKey() throws Exception {
        ObjectNode json = serialize(new NotificationResponse(
                UUID.randomUUID(), NotificationType.VIEWED, "Someone opened your page",
                UUID.randomUUID(), true, LocalDateTime.now()));

        assertThat(json.has("isRead")).as("notification read flag").isTrue();
        assertThat(json.has("read")).as("bean-named duplicate").isFalse();
    }

    @Test
    void replyResponseKeepsIsReadKey() throws Exception {
        ObjectNode json = serialize(new ReplyResponse(
                UUID.randomUUID(), "Loved it", false, LocalDateTime.now()));

        assertThat(json.has("isRead")).as("reply read flag").isTrue();
        assertThat(json.has("read")).as("bean-named duplicate").isFalse();
    }

    @Test
    void micrositeResponseKeepsIsPrefixedFlagKeys() throws Exception {
        ObjectNode json = serialize(new MicrositeResponse(
                UUID.randomUUID(), "Title", "slug", "Recipient", Category.CRUSH,
                MicrositeStatus.PUBLISHED, UUID.randomUUID(),
                true, true, true, true,
                null, "NONE", null,
                null, null, LocalDateTime.now(),
                List.of(), 0, 0));

        assertThat(json.has("isAnonymous")).as("anonymous flag").isTrue();
        assertThat(json.has("isOneTimeView")).as("one-time-view flag").isTrue();
        assertThat(json.has("isPasswordProtected")).as("password gate flag").isTrue();
        assertThat(json.has("anonymous")).as("bean-named duplicate").isFalse();
        assertThat(json.has("oneTimeView")).as("bean-named duplicate").isFalse();
        assertThat(json.has("passwordProtected")).as("bean-named duplicate").isFalse();
    }

    @Test
    void themeResponseKeepsIsPremiumKey() throws Exception {
        ObjectNode json = serialize(new ThemeResponse(
                UUID.randomUUID(), "Theme", "theme", "group", "{}", null, true));

        assertThat(json.has("isPremium")).as("premium flag").isTrue();
        assertThat(json.has("premium")).as("bean-named duplicate").isFalse();
    }

    /**
     * The dashboard card branches on this key: present means "Opened 4m ago",
     * absent or null means "Not opened yet". A rename would not fail any build —
     * every card would just quietly claim nobody has read the page.
     */
    @Test
    void micrositeListResponseCarriesLastViewedAt() throws Exception {
        LocalDateTime opened = LocalDateTime.now();

        ObjectNode viewed = serialize(new MicrositeListResponse(
                UUID.randomUUID(), "Title", "slug", Category.CRUSH,
                MicrositeStatus.PUBLISHED, false, false, false, null, 3, 2, opened, opened.minusDays(1)));

        assertThat(viewed.has("lastViewedAt")).as("last-opened key").isTrue();
        assertThat(viewed.get("lastViewedAt").isNull()).as("opened page").isFalse();

        ObjectNode unopened = serialize(new MicrositeListResponse(
                UUID.randomUUID(), "Title", "slug", Category.CRUSH,
                MicrositeStatus.PUBLISHED, false, false, false, null, 3, 0, null, opened));

        assertThat(unopened.get("lastViewedAt").isNull()).as("never opened").isTrue();
    }
}
