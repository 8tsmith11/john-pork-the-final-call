"""Independent checks for flag notes and complete names in scene lint."""

import unittest

from tools.writing.lint import RULES, flag_names, scene_checks


class WritingLintTest(unittest.TestCase):
    def test_name_requires_the_whole_name(self):
        rule = RULES["bare-sahur"]
        for partial in ("Sahur entered.", "Tung Sahur entered.", "tung tung sahur entered."):
            self.assertRegex(partial, rule)
        self.assertNotRegex("Tung Tung Tung Sahur entered.", rule)

    def test_unread_flags_include_quoted_and_trigger_assignments(self):
        text = (
            "### node: fixture\n"
            "*Set `act1.fixture.unused`, `act1.fixture.read = value`.*\n"
            "*Trigger: arrival. Set `act1.fixture.fromTrigger`.*\n"
        )
        code = flag_names("flags['act1.fixture.unusedOld']")
        conditions = flag_names("flag fixture.read")
        self.assertEqual(
            scene_checks(text, code, conditions)["unread-flag"],
            [("", "act1.fixture.unused"), ("", "act1.fixture.fromTrigger")],
        )

    def test_metadata_does_not_hide_an_opening_pronoun(self):
        text = (
            "### node: fixture\n"
            "*Mode: story*\n"
            "*Set `act1.fixture.seen`.*\n"
            "**TREVOR:** He just got here.\n"
        )
        hits = scene_checks(text, {"act1.fixture.seen"}, set())
        self.assertEqual(hits.get("opening-pronoun"), [("", "He just got here.")])
