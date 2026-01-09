-- イベント削除を有効化するRLSポリシー

-- ユーザーは自分のイベントを削除できる
CREATE POLICY "Users can delete their own events" ON events
  FOR DELETE
  USING (auth.uid() = user_id);
