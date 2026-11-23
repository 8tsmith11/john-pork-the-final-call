"""Focused regressions for the Markdown dialogue converter."""

import unittest

from tools.dialogue.convert import parse


class ConditionalLinesTest(unittest.TestCase):
    def conditions(self, body):
        _, nodes = parse(f"### node: fixture\n{body}#### end\n**TREVOR:** Shared line\n")
        return [line["if"] for line in nodes["fixture"]["lines"]]

    def test_else_is_exclusive_after_a_single_condition(self):
        self.assertEqual(
            self.conditions(
                "#### if flag test.route\n**TREVOR:** First line\n"
                "#### else\n**TREVOR:** Other line\n"
            ),
            ["flag test.route", "not (flag test.route)", None],
        )

    def test_else_is_exclusive_after_one_line_alternatives(self):
        self.assertEqual(
            self.conditions(
                "#### if test.route=1\n**TREVOR:** First line\n"
                "#### if test.route=2\n**TREVOR:** Second line\n"
                "#### else\n**TREVOR:** Other line\n"
            ),
            ["test.route=1", "test.route=2", "not (test.route=1) && not (test.route=2)", None],
        )
