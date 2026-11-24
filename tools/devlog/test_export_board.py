"""python3 -m unittest tools.devlog.test_export_board"""
import codecs
import unittest

from tools.devlog.export_board import once

R = lambda s: codecs.encode(s, "rot_13")


class SealedAsides(unittest.TestCase):
    """The committed board.md must never hold a sealed span in plain text (hub #134). On the board a sealed span is
    already ROT13; the file is ROT13'd as a whole, so once() has to decode each sealed span first."""

    def file_text(self, board_text):
        return R(once(board_text))   # what lands in docs/devlog/board.md

    def assertSealed(self, board_text, secret):
        f = self.file_text(board_text)
        self.assertNotIn(secret, f, "the secret is readable in the committed file")
        self.assertIn(R(secret), f, "the secret is still there, encoded once")

    def test_plain_text_is_encoded_by_the_file(self):
        self.assertEqual(self.file_text("plain words"), R("plain words"))

    def test_a_post_that_starts_sealed(self):
        self.assertSealed("[SEALED] " + R("the twist"), "the twist")

    def test_a_whole_sealed_post_keeps_its_later_lines_sealed(self):
        self.assertSealed("[SEALED] " + R("line one") + "\n" + R("line two"), "line two")

    def test_an_aside_after_plain_text(self):
        self.assertSealed("Fit notes are below. [SEALED] " + R("the secret part"), "the secret part")

    def test_a_sealed_paragraph_later_in_a_post(self):
        post = "Plain opening.\n[SEALED] " + R("hidden paragraph") + "\nPlain closing."
        self.assertSealed(post, "hidden paragraph")
        self.assertIn(R("Plain closing."), self.file_text(post), "the plain paragraph after it is only file-encoded")

    def test_opening_the_file_on_purpose_reads_everything(self):
        post = "Notes. [SEALED] " + R("the secret part")
        self.assertEqual(R(self.file_text(post)), "Notes. [SEALED] the secret part")

    def test_empty_and_missing_notes(self):
        self.assertEqual(once(None), "")
        self.assertEqual(once(""), "")


if __name__ == "__main__":
    unittest.main()
