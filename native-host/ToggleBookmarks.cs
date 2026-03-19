using System;
using System.IO;
using System.Runtime.InteropServices;
using System.Text;

class Program
{
    [DllImport("user32.dll")]
    static extern void keybd_event(byte bVk, byte bScan, uint dwFlags, UIntPtr dwExtraInfo);

    const byte VK_CONTROL = 0x11;
    const byte VK_SHIFT = 0x10;
    const byte VK_B = 0x42;
    const uint KEYEVENTF_KEYUP = 0x0002;

    static void SendCtrlShiftB()
    {
        keybd_event(VK_CONTROL, 0, 0, UIntPtr.Zero);
        keybd_event(VK_SHIFT, 0, 0, UIntPtr.Zero);
        keybd_event(VK_B, 0, 0, UIntPtr.Zero);
        keybd_event(VK_B, 0, KEYEVENTF_KEYUP, UIntPtr.Zero);
        keybd_event(VK_SHIFT, 0, KEYEVENTF_KEYUP, UIntPtr.Zero);
        keybd_event(VK_CONTROL, 0, KEYEVENTF_KEYUP, UIntPtr.Zero);
    }

    static void Main()
    {
        var stdin = Console.OpenStandardInput();
        var stdout = Console.OpenStandardOutput();

        while (true)
        {
            // Read 4-byte length header (native messaging protocol)
            byte[] header = new byte[4];
            int bytesRead = stdin.Read(header, 0, 4);
            if (bytesRead == 0) break;

            int length = BitConverter.ToInt32(header, 0);
            byte[] body = new byte[length];
            stdin.Read(body, 0, length);

            // Toggle Chrome's bookmarks bar
            SendCtrlShiftB();

            // Write response
            byte[] response = Encoding.UTF8.GetBytes("{\"status\":\"ok\"}");
            byte[] respHeader = BitConverter.GetBytes(response.Length);
            stdout.Write(respHeader, 0, 4);
            stdout.Write(response, 0, response.Length);
            stdout.Flush();
        }
    }
}
